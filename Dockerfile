# -----------------------------------------------------------------------------
# Optimized Dockerfile for Turbo Monorepo - Next.js App (apps/holo)
# Uses multi-stage builds, pnpm, and Turbo pruning for optimal performance
# -----------------------------------------------------------------------------

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -----------------------------------------------------------------------------
# Stage 1: Prune the monorepo to only include the holo app and its dependencies
# This dramatically reduces the build context and speeds up subsequent stages
# -----------------------------------------------------------------------------
FROM base AS pruner
WORKDIR /app

RUN npm install -g turbo@2.0.6

COPY . .

# Prune the workspace for the holo app - this creates a minimal subset
RUN turbo prune holo --docker

# -----------------------------------------------------------------------------
# Stage 2: Install production dependencies only
# Leverages layer caching - only rebuilds if lockfile changes
# -----------------------------------------------------------------------------
FROM base AS installer-deps
WORKDIR /app

# Copy pruned lockfile and package.json files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies with frozen lockfile for reproducibility
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

# -----------------------------------------------------------------------------
# Stage 3: Install all dependencies (including dev) and build the application
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy pruned workspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install all dependencies (including devDependencies needed for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build arguments for environment variables (customize as needed)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1


# Build the application using Turbo
# Turbo will cache and only rebuild what's necessary
RUN pnpm turbo build --filter=holo...

# -----------------------------------------------------------------------------
# Stage 4: Production runtime - minimal image with only necessary files
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_POSTHOG_KEY=phc_iwm7W6wT7S6QPTLzdxSDVqnDAK57vLulsUBkQjvclgu
ENV NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone output (self-contained, minimal)
# This includes only the necessary files to run the app
COPY --from=builder --chown=nextjs:nodejs /app/apps/holo/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/holo/.next/static ./apps/holo/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/holo/public ./apps/holo/public

USER nextjs

EXPOSE 3000

# Start the Next.js server
CMD ["node", "apps/holo/server.js"]