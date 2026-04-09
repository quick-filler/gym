# syntax=docker/dockerfile:1.7
#
# Expo dev server for remote testing via Expo Go.
#
# What this image does:
#   - Runs `expo start` bound to 0.0.0.0 on port 8081.
#   - Advertises REACT_NATIVE_PACKAGER_HOSTNAME (the VPS's public host)
#     in the exp:// URL so QR codes scanned by Expo Go actually resolve.
#   - Serves a tiny landing page on port 80 with the QR code rendered as
#     a PNG, so testers don't need SSH access to see the QR.
#
# This is a DEV/TEST image. It ships all dev dependencies, Metro, and the
# full source tree. Do not deploy it as a production app binary.

FROM node:22-alpine
WORKDIR /app

ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    EXPO_NO_TELEMETRY=1 \
    CI=1

# EXPO_TOKEN is consumed by the Expo CLI for any authenticated operation
# (eas update / build / submit). It is NEVER baked into the image — pass
# it at runtime with `-e EXPO_TOKEN=...` or `--env-file .env`. Declaring
# it here only documents the contract and lets the entrypoint warn
# cleanly when it's missing for commands that need it.
ENV EXPO_TOKEN=""

# libqrencode-tools → `qrencode` CLI used by the entrypoint to draw the QR PNG
# busybox-extras    → adds the `httpd` applet that the entrypoint uses to
#                     serve /srv/www. The base `busybox` in node:22-alpine
#                     does NOT ship httpd; installing this package provides
#                     a second binary at /usr/bin/busybox-extras with the
#                     extra applets enabled. Must be invoked explicitly as
#                     `busybox-extras httpd ...` (no bare `httpd` symlink).
# git               → some npm postinstalls still need it
RUN apk add --no-cache libc6-compat git libqrencode-tools busybox-extras

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --prefer-offline

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 80   → QR-code landing page
# 8081 → Metro bundler / dev server (what Expo Go connects to)
EXPOSE 80 8081

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
