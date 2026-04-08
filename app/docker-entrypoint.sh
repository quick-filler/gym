#!/bin/sh
#
# Entrypoint for the gym Expo dev server.
#
# 1. Validates PUBLIC_HOST (the hostname or IP testers will reach) and
#    pins it into REACT_NATIVE_PACKAGER_HOSTNAME so Metro bakes it into
#    the exp:// URL instead of its own container IP.
# 2. Generates a QR code PNG + landing page at /srv/www.
# 3. Starts busybox httpd in the background on :80 to serve the page.
# 4. Execs `expo start` in the foreground so signals reach Metro.

set -eu

if [ -z "${PUBLIC_HOST:-}" ]; then
  echo "error: PUBLIC_HOST env var is required" >&2
  echo "       set it to the public hostname or IP testers will reach" >&2
  echo "       e.g. -e PUBLIC_HOST=expo.gym.app" >&2
  exit 1
fi

PORT_METRO="${PORT_METRO:-8081}"
EXP_URL="exp://${PUBLIC_HOST}:${PORT_METRO}"

export REACT_NATIVE_PACKAGER_HOSTNAME="${PUBLIC_HOST}"

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
    Bundler host: <code>${PUBLIC_HOST}:${PORT_METRO}</code>
  </p>
</body>
</html>
HTML

echo ">> serving QR page at http://${PUBLIC_HOST}/"
echo ">>   exp URL = ${EXP_URL}"

# Tiny static server for the QR landing page. `-f` keeps it foregrounded
# in the subshell so we can background the whole thing cleanly.
busybox httpd -f -p 0.0.0.0:80 -h /srv/www &

# Metro bundler + Expo CLI in the foreground. --host lan tells Metro to
# bind on 0.0.0.0 and use REACT_NATIVE_PACKAGER_HOSTNAME for URLs.
# --go forces the Expo Go scheme (no dev client shim).
exec npx expo start --host lan --port "${PORT_METRO}" --go
