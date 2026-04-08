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

# libqrencode-tools → `qrencode` CLI used by the entrypoint
# busybox → already in the base image but apk ensures `httpd` applet is present
# git     → some npm postinstalls still need it
RUN apk add --no-cache libc6-compat git libqrencode-tools

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
