# syntax=docker/dockerfile:1.7
#
# Next.js 16 production image.
#
# Build-speed strategy:
#   - BuildKit cache mounts: /root/.npm keeps npm downloads warm and
#     /app/.next/cache keeps the webpack/turbopack build cache warm across
#     rebuilds (incremental builds take seconds instead of minutes).
#   - `deps` is a separate stage keyed only on package-lock.json, so source
#     edits never rerun `npm ci`.
#
# Size strategy:
#   - next.config.ts sets `output: "standalone"`, which bundles only the
#     modules the server actually imports into .next/standalone.
#   - The runtime stage copies three small trees (standalone, static,
#     public) and nothing else — no node_modules, no source, no dev deps.

ARG NODE_VERSION=22-alpine

# ---- Shared base -----------------------------------------------------------
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false


# ---- Dependencies ----------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --prefer-offline


# ---- Build -----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time —
# pass them via `docker build --build-arg` when overriding defaults.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GRAPHQL_ENDPOINT
ARG NEXT_PUBLIC_APP_DOMAIN
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_GRAPHQL_ENDPOINT=${NEXT_PUBLIC_GRAPHQL_ENDPOINT} \
    NEXT_PUBLIC_APP_DOMAIN=${NEXT_PUBLIC_APP_DOMAIN}

# The .next/cache mount preserves Next's incremental build cache between
# `docker build` invocations — this is where the real speedup comes from.
RUN --mount=type=cache,target=/app/.next/cache,sharing=locked \
    npm run build


# ---- Runtime ---------------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache tini

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone output: .next/standalone already contains server.js plus the
# minimal node_modules the server traced. static/ and public/ are served
# by that server but aren't auto-bundled, so we copy them alongside.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
