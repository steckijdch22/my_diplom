# Этап 1: Сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Этап 2: Запуск
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./ 

EXPOSE 3000

# ВАЖНО: Добавляем отладочный лог, чтобы увидеть, видит ли система URL
CMD ["sh", "-c", "echo 'Checking DB URL...' && npx prisma migrate deploy && node dist/src/main"]