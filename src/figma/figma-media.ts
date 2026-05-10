import { BadRequestException } from '@nestjs/common';
import { join } from 'node:path';

interface UploadedFigmaFile {
  originalname: string;
  mimetype: string;
  path: string;
}

const FIGMA_UPLOAD_DIR = join(process.cwd(), 'uploads', 'figma');
const FIGMA_PUBLIC_MEDIA_PATH = '/api/uploads/figma';
const FIGMA_MEDIA_MAX_SIZE = 10 * 1024 * 1024;
const FIGMA_ALLOWED_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const figmaMediaUploadOptions = {
  dest: FIGMA_UPLOAD_DIR,
  limits: { fileSize: FIGMA_MEDIA_MAX_SIZE, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!FIGMA_ALLOWED_MEDIA_TYPES.has(file.mimetype)) {
      callback(
        new BadRequestException('Можно загрузить только фото или GIF'),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

export {
  FIGMA_ALLOWED_MEDIA_TYPES,
  FIGMA_PUBLIC_MEDIA_PATH,
  FIGMA_UPLOAD_DIR,
  figmaMediaUploadOptions,
  type UploadedFigmaFile,
};
