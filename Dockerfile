# daily-routine-learn-backend — NestJS + Prisma
# Сборка: docker build -t daily-routine-learn-backend .
# Запуск: docker run -p 4000:4000 -e DATABASE_URL=... daily-routine-learn-backend

# --- Stage 1: зависимости ---
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: сборка ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate && npm run build

# --- Stage 3: production ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev && npm install prisma --no-save && chown -R nestjs:nodejs node_modules

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts ./

USER nestjs

EXPOSE 4000

# При первом запуске: docker compose run --rm app npx prisma migrate deploy
CMD ["node", "dist/main.js"]
