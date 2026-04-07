FROM oven/bun:1.2 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
FROM node:22-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
