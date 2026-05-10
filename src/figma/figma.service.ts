import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FigmaChapterGetPayload } from '../../generated/prisma/models/FigmaChapter.js';
import type { FigmaSection } from '../../generated/prisma/client.js';
import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import {
  FIGMA_ALLOWED_MEDIA_TYPES,
  FIGMA_PUBLIC_MEDIA_PATH,
  FIGMA_UPLOAD_DIR,
  type UploadedFigmaFile,
} from './figma-media.js';
import type {
  CreateFigmaChapterDto,
  CreateFigmaSectionDto,
  UpdateFigmaChapterDto,
  UpdateFigmaSectionDto,
} from './figma-request.dto.js';
import type {
  FigmaChapterResponseDto,
  FigmaMediaResponseDto,
  FigmaSectionResponseDto,
} from './figma-response.dto.js';

type FigmaChapterWithSections = FigmaChapterGetPayload<{
  include: { sections: true };
}>;

const includeSections = {
  include: {
    sections: { orderBy: { order: 'asc' as const } },
  },
} as const;

function toFigmaSectionResponseDto(
  section: FigmaSection,
): FigmaSectionResponseDto {
  return {
    id: section.id,
    chapterId: section.chapterId,
    title: section.title,
    content: section.content,
    order: section.order,
  };
}

function toFigmaChapterResponseDto(
  chapter: FigmaChapterWithSections,
): FigmaChapterResponseDto {
  return {
    id: chapter.id,
    title: chapter.title,
    order: chapter.order,
    sections: chapter.sections.map(toFigmaSectionResponseDto),
  };
}

function ensureUploadDir() {
  if (!existsSync(FIGMA_UPLOAD_DIR)) {
    mkdirSync(FIGMA_UPLOAD_DIR, { recursive: true });
  }
}

function extensionFor(file: UploadedFigmaFile) {
  const originalExtension = extname(file.originalname).toLowerCase();
  if (originalExtension) return originalExtension;

  switch (file.mimetype) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '';
  }
}

@Injectable()
export class FigmaService {
  async recalculateChapterOrder(): Promise<void> {
    const chapters = await prisma.figmaChapter.findMany({
      orderBy: { order: 'asc' },
    });

    let order = 1;
    for (const chapter of chapters) {
      if (chapter.order !== order) {
        await prisma.figmaChapter.update({
          where: { id: chapter.id },
          data: { order },
        });
      }
      order++;
    }
  }

  async recalculateSectionOrder(chapterId: string): Promise<void> {
    const sections = await prisma.figmaSection.findMany({
      where: { chapterId },
      orderBy: { order: 'asc' },
    });

    let order = 1;
    for (const section of sections) {
      if (section.order !== order) {
        await prisma.figmaSection.update({
          where: { id: section.id },
          data: { order },
        });
      }
      order++;
    }
  }

  async findAllChapters(): Promise<FigmaChapterResponseDto[]> {
    const chapters = await prisma.figmaChapter.findMany({
      orderBy: { order: 'asc' },
      ...includeSections,
    });
    return chapters.map(toFigmaChapterResponseDto);
  }

  async findChapter(id: string): Promise<FigmaChapterResponseDto> {
    const chapter = await prisma.figmaChapter.findUnique({
      where: { id },
      ...includeSections,
    });
    if (!chapter) {
      throw new NotFoundException(`Глава Figma с id ${id} не найдена`);
    }
    return toFigmaChapterResponseDto(chapter);
  }

  async createChapter(
    dto: CreateFigmaChapterDto,
  ): Promise<FigmaChapterResponseDto> {
    const chapter = await prisma.$transaction(async (tx) => {
      const toShift = await tx.figmaChapter.findMany({
        where: { order: { gte: dto.order } },
        select: { id: true, order: true },
        orderBy: { order: 'desc' },
      });

      for (const item of toShift) {
        await tx.figmaChapter.update({
          where: { id: item.id },
          data: { order: item.order + 1 },
        });
      }

      return await tx.figmaChapter.create({
        data: { title: dto.title, order: dto.order },
        ...includeSections,
      });
    });

    await this.recalculateChapterOrder();

    return toFigmaChapterResponseDto(chapter);
  }

  async updateChapter(
    id: string,
    dto: UpdateFigmaChapterDto,
  ): Promise<FigmaChapterResponseDto> {
    const existing = await prisma.figmaChapter.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Глава Figma с id ${id} не найдена`);
    }

    const data: { title?: string; order?: number } = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.order !== undefined) data.order = dto.order;

    if (Object.keys(data).length === 0) {
      return this.findChapter(id);
    }

    if (dto.order !== undefined && dto.order !== existing.order) {
      const chapter = await prisma.$transaction(async (tx) => {
        const oldOrder = existing.order;
        const newOrder = dto.order!;

        if (newOrder > oldOrder) {
          const toShift = await tx.figmaChapter.findMany({
            where: {
              id: { not: id },
              order: { gt: oldOrder, lte: newOrder },
            },
            select: { id: true, order: true },
            orderBy: { order: 'asc' },
          });

          for (const item of toShift) {
            await tx.figmaChapter.update({
              where: { id: item.id },
              data: { order: item.order - 1 },
            });
          }
        } else {
          const toShift = await tx.figmaChapter.findMany({
            where: {
              id: { not: id },
              order: { gte: newOrder, lt: oldOrder },
            },
            select: { id: true, order: true },
            orderBy: { order: 'desc' },
          });

          for (const item of toShift) {
            await tx.figmaChapter.update({
              where: { id: item.id },
              data: { order: item.order + 1 },
            });
          }
        }

        return await tx.figmaChapter.update({
          where: { id },
          data,
          ...includeSections,
        });
      });

      await this.recalculateChapterOrder();

      return toFigmaChapterResponseDto(chapter);
    }

    const chapter = await prisma.figmaChapter.update({
      where: { id },
      data,
      ...includeSections,
    });
    return toFigmaChapterResponseDto(chapter);
  }

  async deleteChapter(id: string): Promise<void> {
    const chapter = await prisma.figmaChapter.findUnique({ where: { id } });
    if (!chapter) {
      throw new NotFoundException(`Глава Figma с id ${id} не найдена`);
    }

    await prisma.$transaction(async (tx) => {
      const toShift = await tx.figmaChapter.findMany({
        where: { order: { gt: chapter.order } },
        select: { id: true, order: true },
        orderBy: { order: 'asc' },
      });

      for (const item of toShift) {
        await tx.figmaChapter.update({
          where: { id: item.id },
          data: { order: item.order - 1 },
        });
      }

      await tx.figmaChapter.delete({ where: { id } });
    });

    await this.recalculateChapterOrder();
  }

  async createSection(
    dto: CreateFigmaSectionDto,
  ): Promise<FigmaSectionResponseDto> {
    const chapter = await prisma.figmaChapter.findUnique({
      where: { id: dto.chapterId },
    });
    if (!chapter) {
      throw new NotFoundException(
        `Глава Figma с id ${dto.chapterId} не найдена`,
      );
    }

    const section = await prisma.$transaction(async (tx) => {
      const toShift = await tx.figmaSection.findMany({
        where: {
          chapterId: dto.chapterId,
          order: { gte: dto.order },
        },
        select: { id: true, order: true },
        orderBy: { order: 'desc' },
      });

      for (const item of toShift) {
        await tx.figmaSection.update({
          where: { id: item.id },
          data: { order: item.order + 1 },
        });
      }

      return await tx.figmaSection.create({
        data: {
          chapterId: dto.chapterId,
          title: dto.title ?? '',
          content: dto.content,
          order: dto.order,
        },
      });
    });

    await this.recalculateSectionOrder(dto.chapterId);

    return toFigmaSectionResponseDto(section);
  }

  async updateSection(
    id: string,
    dto: UpdateFigmaSectionDto,
  ): Promise<FigmaSectionResponseDto> {
    const existing = await prisma.figmaSection.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Раздел Figma с id ${id} не найден`);
    }

    const targetChapterId = dto.chapterId ?? existing.chapterId;
    if (targetChapterId !== existing.chapterId) {
      const chapter = await prisma.figmaChapter.findUnique({
        where: { id: targetChapterId },
      });
      if (!chapter) {
        throw new NotFoundException(
          `Глава Figma с id ${targetChapterId} не найдена`,
        );
      }
    }

    const data: {
      chapterId?: string;
      title?: string;
      content?: string;
      order?: number;
    } = {};
    if (dto.chapterId !== undefined) data.chapterId = dto.chapterId;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.order !== undefined) data.order = dto.order;

    if (Object.keys(data).length === 0) {
      return toFigmaSectionResponseDto(existing);
    }

    if (targetChapterId !== existing.chapterId) {
      const newOrder = dto.order ?? existing.order;
      const section = await prisma.$transaction(async (tx) => {
        const oldChapterItems = await tx.figmaSection.findMany({
          where: {
            chapterId: existing.chapterId,
            order: { gt: existing.order },
          },
          select: { id: true, order: true },
          orderBy: { order: 'asc' },
        });

        for (const item of oldChapterItems) {
          await tx.figmaSection.update({
            where: { id: item.id },
            data: { order: item.order - 1 },
          });
        }

        const newChapterItems = await tx.figmaSection.findMany({
          where: {
            chapterId: targetChapterId,
            order: { gte: newOrder },
          },
          select: { id: true, order: true },
          orderBy: { order: 'desc' },
        });

        for (const item of newChapterItems) {
          await tx.figmaSection.update({
            where: { id: item.id },
            data: { order: item.order + 1 },
          });
        }

        return await tx.figmaSection.update({
          where: { id },
          data: { ...data, chapterId: targetChapterId, order: newOrder },
        });
      });

      await this.recalculateSectionOrder(existing.chapterId);
      await this.recalculateSectionOrder(targetChapterId);

      return toFigmaSectionResponseDto(section);
    }

    if (dto.order !== undefined && dto.order !== existing.order) {
      const section = await prisma.$transaction(async (tx) => {
        const oldOrder = existing.order;
        const newOrder = dto.order!;

        if (newOrder > oldOrder) {
          const toShift = await tx.figmaSection.findMany({
            where: {
              id: { not: id },
              chapterId: existing.chapterId,
              order: { gt: oldOrder, lte: newOrder },
            },
            select: { id: true, order: true },
            orderBy: { order: 'asc' },
          });

          for (const item of toShift) {
            await tx.figmaSection.update({
              where: { id: item.id },
              data: { order: item.order - 1 },
            });
          }
        } else {
          const toShift = await tx.figmaSection.findMany({
            where: {
              id: { not: id },
              chapterId: existing.chapterId,
              order: { gte: newOrder, lt: oldOrder },
            },
            select: { id: true, order: true },
            orderBy: { order: 'desc' },
          });

          for (const item of toShift) {
            await tx.figmaSection.update({
              where: { id: item.id },
              data: { order: item.order + 1 },
            });
          }
        }

        return await tx.figmaSection.update({
          where: { id },
          data,
        });
      });

      await this.recalculateSectionOrder(existing.chapterId);

      return toFigmaSectionResponseDto(section);
    }

    const section = await prisma.figmaSection.update({
      where: { id },
      data,
    });
    return toFigmaSectionResponseDto(section);
  }

  async deleteSection(id: string): Promise<void> {
    const section = await prisma.figmaSection.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Раздел Figma с id ${id} не найден`);
    }

    await prisma.$transaction(async (tx) => {
      const toShift = await tx.figmaSection.findMany({
        where: {
          chapterId: section.chapterId,
          order: { gt: section.order },
        },
        select: { id: true, order: true },
        orderBy: { order: 'asc' },
      });

      for (const item of toShift) {
        await tx.figmaSection.update({
          where: { id: item.id },
          data: { order: item.order - 1 },
        });
      }

      await tx.figmaSection.delete({ where: { id } });
    });

    await this.recalculateSectionOrder(section.chapterId);
  }

  uploadMedia(
    file: UploadedFigmaFile | undefined,
    origin: string,
  ): FigmaMediaResponseDto {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!FIGMA_ALLOWED_MEDIA_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Можно загрузить только фото или GIF');
    }

    ensureUploadDir();

    const filename = `${randomUUID()}${extensionFor(file)}`;
    const finalPath = join(FIGMA_UPLOAD_DIR, filename);

    renameSync(file.path, finalPath);

    return { url: `${origin}${FIGMA_PUBLIC_MEDIA_PATH}/${filename}` };
  }
}
