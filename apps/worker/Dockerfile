FROM node:20-alpine AS base

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json turbo.json tsconfig.base.json ./

# Copy packages
COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

# Install dependencies
RUN npm ci

# Build shared and worker
RUN npm run build --workspace=@multiblast/shared
RUN npm run build --workspace=@multiblast/worker

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/shared ./packages/shared
COPY --from=base /app/apps/worker ./apps/worker

CMD ["npx", "tsx", "apps/worker/src/index.ts"]
