# ============================================================
# HERMES DASHBOARD - FRONTEND DOCKERFILE
# Optimized multi-stage build for Next.js 15 + React 19 + Tailwind CSS
# Production: lightweight standalone output (~50MB)
# Development: hot-reload with volume mounts
# ============================================================

# ============================================================
# BASE STAGE - Shared dependencies
# ============================================================
FROM node:22-alpine AS base

# Install system dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    git \
    python3 \
    make \
    g++ \
    && corepack enable

WORKDIR /app

# ============================================================
# DEPENDENCIES STAGE - Install npm packages
# ============================================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --prefer-offline --no-audit --no-fund

# ============================================================
# BUILDER STAGE - Build Next.js application
# ============================================================
FROM base AS builder

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_HERMES_API
ARG NEXT_PUBLIC_WS_HERMES
ARG NEXT_PUBLIC_DASHBOARD_PATH

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_HERMES_API=${NEXT_PUBLIC_HERMES_API}
ENV NEXT_PUBLIC_WS_HERMES=${NEXT_PUBLIC_WS_HERMES}
ENV NEXT_PUBLIC_DASHBOARD_PATH=${NEXT_PUBLIC_DASHBOARD_PATH}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ============================================================
# RUNNER STAGE - Production image (standalone output)
# ============================================================
FROM node:22-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application (standalone output)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3800

ENV PORT=3800
ENV HOSTNAME="0.0.0.0"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# ============================================================
# DEVELOPMENT STAGE - Hot reload with volume mounts
# ============================================================
FROM base AS development

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Install all dependencies including devDependencies
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund

EXPOSE 3800

ENV PORT=3800
ENV HOSTNAME="0.0.0.0"

# Start development server with hot reload
CMD ["npm", "run", "dev"]