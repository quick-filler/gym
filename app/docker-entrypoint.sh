#!/bin/sh
#
# Entrypoint for the gym Expo dev server.
#
# The container runs two things on two ports:
#
#   :80    busybox-extras httpd — serves /srv/www, the QR-code landing
#          page with instructions for opening the app in Expo Go.
#   :8081  Metro bundler (via `expo start --go`) — Expo Go connects here
#          to download the manifest and JS bundle.
#
# Hostnames:
#
#   PUBLIC_HOST       (required)  hostname where the QR landing page is
#                                 reachable from a browser. Usually fronted
#                                 by Traefik/Dokploy with TLS → container:80.
#
#   METRO_PUBLIC_URL  (optional)  full URL where Metro is reachable from
#                                 phones, e.g. `https://expo.app.gym.app`.
#                                 When set, Metro advertises this exact URL
#                                 as the manifest URL (no :8081 port). The
#                                 QR code encodes it too. Point a second
#                                 Traefik router at container:8081 with TLS.
#                                 When unset, we fall back to the legacy
#                                 `exp://${PUBLIC_HOST}:8081` — no separate
#                                 subdomain, no TLS.

set -eu

if [ -z "${PUBLIC_HOST:-}" ]; then
  echo "error: PUBLIC_HOST env var is required" >&2
  echo "       set it to the hostname of the QR landing page, e.g." >&2
  echo "       -e PUBLIC_HOST=expo.gym.app" >&2
  exit 1
fi

PORT_METRO="${PORT_METRO:-8081}"

# Strip a single trailing slash from METRO_PUBLIC_URL for consistency.
METRO_PUBLIC_URL="${METRO_PUBLIC_URL:-}"
METRO_PUBLIC_URL="${METRO_PUBLIC_URL%/}"

if [ -n "${METRO_PUBLIC_URL}" ]; then
  # Advertised mode — a Traefik router fronts Metro with TLS.
  #
  # Parse the URL into its parts. The `exp://` URL we build for the QR
  # has to match EXACTLY what @expo/cli would produce when
  # EXPO_PACKAGER_PROXY_URL is set and scheme='exp' is requested. See
  # node_modules/expo/node_modules/@expo/cli/build/src/start/server/
  #   {UrlCreator,BundlerDevServer}.js
  # The logic there is:
  #   - protocol stays "exp" (so the phone deep-links into Expo Go)
  #   - port is taken from the proxy URL; if empty and the proxy URL is
  #     https:// then it's forced to 443
  # The resulting URL looks like `exp://host:443`. Encoding anything else
  # in the QR (like a bare https:// URL) makes the phone camera open it
  # in a browser instead of Expo Go.
  METRO_SCHEME=$(printf '%s' "${METRO_PUBLIC_URL}" | sed -E 's|^([a-zA-Z]+)://.*$|\1|')
  METRO_HOST=$(printf '%s' "${METRO_PUBLIC_URL}" | sed -E 's|^[a-zA-Z]+://||; s|/.*$||; s|:[0-9]+$||')
  METRO_EXPLICIT_PORT=$(printf '%s' "${METRO_PUBLIC_URL}" | sed -nE 's|^[a-zA-Z]+://[^/]+:([0-9]+).*$|\1|p')
  if [ -n "${METRO_EXPLICIT_PORT}" ]; then
    METRO_ADVERTISED_PORT="${METRO_EXPLICIT_PORT}"
  elif [ "${METRO_SCHEME}" = "https" ]; then
    METRO_ADVERTISED_PORT="443"
  else
    METRO_ADVERTISED_PORT="80"
  fi

  export REACT_NATIVE_PACKAGER_HOSTNAME="${METRO_HOST}"
  export EXPO_PACKAGER_PROXY_URL="${METRO_PUBLIC_URL}"

  # `exp://` scheme is what makes the phone deep-link into Expo Go.
  EXP_URL="exp://${METRO_HOST}:${METRO_ADVERTISED_PORT}"
  BUNDLER_LABEL="${METRO_PUBLIC_URL}"
else
  # Legacy mode — no separate Metro subdomain. Expo Go connects directly
  # to the bundler at exp://PUBLIC_HOST:8081 (needs the port open).
  export REACT_NATIVE_PACKAGER_HOSTNAME="${PUBLIC_HOST}"
  EXP_URL="exp://${PUBLIC_HOST}:${PORT_METRO}"
  BUNDLER_LABEL="${PUBLIC_HOST}:${PORT_METRO}"
fi

mkdir -p /srv/www
qrencode -o /srv/www/qr.png -s 10 -m 2 "${EXP_URL}"

cat >/srv/www/index.html <<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Gym — dev preview</title>
  <style>
    :root { color-scheme: light; }
    body {
      font-family: -apple-system, system-ui, sans-serif;
      max-width: 28rem;
      margin: 3rem auto;
      padding: 0 1.25rem;
      color: #111;
      line-height: 1.5;
    }
    h1 { font-size: 1.35rem; margin-bottom: .25rem; }
    p  { color: #374151; }
    .qr {
      display: block;
      width: 100%;
      max-width: 22rem;
      margin: 1.5rem auto;
      image-rendering: pixelated;
    }
    code {
      background: #f3f4f6;
      padding: .15rem .45rem;
      border-radius: .3rem;
      font-size: .9em;
      word-break: break-all;
    }
    .steps { padding-left: 1.1rem; }
    .steps li + li { margin-top: .35rem; }
  </style>
</head>
<body>
  <h1>Gym student app — dev preview</h1>
  <p>This is a live development build. Scan the QR code with Expo Go.</p>

  <img class="qr" src="/qr.png" alt="QR code linking to ${EXP_URL}" />

  <ol class="steps">
    <li>Install <a href="https://expo.dev/go">Expo Go</a> on your phone.</li>
    <li>Open it and scan the QR code above
      (Android: tap "Scan QR code"; iOS: use the Camera app).</li>
    <li>Or paste this URL manually: <code>${EXP_URL}</code></li>
  </ol>

  <p style="margin-top:2rem;color:#6b7280;font-size:.85rem;">
    Bundler host: <code>${BUNDLER_LABEL}</code>
  </p>
</body>
</html>
HTML

echo ">> serving QR page at http://${PUBLIC_HOST}/"
echo ">>   exp URL = ${EXP_URL}"
if [ -n "${METRO_PUBLIC_URL}" ]; then
  echo ">>   metro advertised as ${METRO_PUBLIC_URL} (EXPO_PACKAGER_PROXY_URL)"
fi

# Show whether the CLI is authenticated. We only check for the presence
# of the env var — no network call, no token contents printed. Serving
# the dev bundle via `expo start --go` does not need a token; this line
# exists so you can confirm EXPO_TOKEN reached the container before
# running `eas update` / `eas build` inside it.
if [ -n "${EXPO_TOKEN:-}" ]; then
  echo ">>   expo auth = token present (${#EXPO_TOKEN} chars)"
else
  echo ">>   expo auth = anonymous (no EXPO_TOKEN set)"
fi

# Tiny static server for the QR landing page. `-f` keeps it foregrounded
# in the subshell so we can background the whole thing cleanly.
#
# The `httpd` applet is NOT in node:22-alpine's default busybox — it lives
# in the `busybox-extras` package which the Dockerfile installs. Invoke
# via `busybox-extras httpd` explicitly; there is no bare `httpd` symlink.
busybox-extras httpd -f -p 0.0.0.0:80 -h /srv/www &

# Metro bundler + Expo CLI in the foreground. --host lan tells Metro to
# bind on 0.0.0.0 and use REACT_NATIVE_PACKAGER_HOSTNAME for URLs.
# --go forces the Expo Go scheme (no dev client shim).
exec npx expo start --host lan --port "${PORT_METRO}" --go
