# Multi-stage build for Next.js (Node 20)
FROM node:20-alpine AS deps
WORKDIR /workspace/frontend

# Install frontend deps first for better layer caching.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /workspace/frontend
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /workspace/frontend/node_modules ./node_modules
COPY frontend/. .
COPY shared /workspace/shared

# Build app. The frontend imports from ../shared/src, so the Docker
# build context must include both directories.
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Only the pieces required to run the app.
COPY --from=deps /workspace/frontend/node_modules ./node_modules
COPY --from=builder /workspace/frontend/.next ./.next
COPY --from=builder /workspace/frontend/public ./public
COPY --from=builder /workspace/frontend/package.json ./package.json
COPY --from=builder /workspace/frontend/next.config.ts ./next.config.ts

EXPOSE 3002
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3002"]
