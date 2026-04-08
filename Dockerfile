FROM oven/bun:1.2 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:22-slim AS runner
# dumb-init garantiza que SIGTERM llega al proceso Node y libera el puerto
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
EXPOSE 4321
STOPSIGNAL SIGTERM
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./dist/server/entry.mjs"]
