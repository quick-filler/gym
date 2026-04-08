# syntax=docker/dockerfile:1.7
#
# Strapi v5 production image.
#
# Build-speed strategy:
#   - BuildKit cache mounts on /root/.npm keep node_modules fetches warm
#     across rebuilds (npm ci drops to seconds after the first build).
#   - `deps` and `prod-deps` stages run in parallel under BuildKit so the
#     runtime layer isn't waiting on the admin panel build.
#   - Source COPY lives after deps so unrelated code edits never invalidate
#     the npm layer.
#
# Size strategy:
#   - Runtime stage has no build toolchain — only `vips` (not `vips-dev`)
#     and a pruned, prod-only node_modules coming from `prod-deps`.
#   - TS source, tests, docs, and dev deps are left in the builder stage.

ARG NODE_VERSION=22-alpine

# ---- Shared base -----------------------------------------------------------
FROM node:${NODE_VERSION} AS base
WORKDIR /opt/app
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false


# ---- Full dependency install (used by builder) -----------------------------
FROM base AS deps
# Native toolchain only lives in this transient stage — required by sharp /
# node-gyp when a prebuilt binary isn't available for the current musl arch.
RUN apk add --no-cache libc6-compat vips-dev build-base python3 git
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --prefer-offline


# ---- Prod-only install (runs in parallel with `deps`) ----------------------
FROM base AS prod-deps
RUN apk add --no-cache libc6-compat vips-dev build-base python3 git
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev --prefer-offline


# ---- Build: compile TypeScript + admin panel -------------------------------
FROM deps AS builder
COPY . .
RUN npm run build


# ---- Runtime: minimal image -----------------------------------------------
FROM base AS runner
# `vips` is the runtime-only libvips; `vips-dev` pulls in headers we no
# longer need. `tini` handles PID 1 signal forwarding cleanly.
RUN apk add --no-cache vips tini

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337

# Strapi reads content-type schema JSON from src/ at runtime, so src/ stays.
COPY --from=prod-deps --chown=node:node /opt/app/node_modules ./node_modules
COPY --from=builder   --chown=node:node /opt/app/package.json ./package.json
COPY --from=builder   --chown=node:node /opt/app/config ./config
COPY --from=builder   --chown=node:node /opt/app/src ./src
COPY --from=builder   --chown=node:node /opt/app/public ./public
COPY --from=builder   --chown=node:node /opt/app/database ./database
COPY --from=builder   --chown=node:node /opt/app/dist ./dist
COPY --from=builder   --chown=node:node /opt/app/favicon.png ./favicon.png

USER node
EXPOSE 1337
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "start"]
