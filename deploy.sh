#!/usr/bin/env bash
set -euo pipefail

echo "[1/4] Build image"
docker compose build

echo "[2/4] Start services"
docker compose up -d

echo "[3/4] Wait health"
for i in {1..20}; do
  if curl -fsS http://localhost/healthz >/dev/null; then
    echo "Service healthy"
    break
  fi
  sleep 2
  if [[ "$i" -eq 20 ]]; then
    echo "Healthcheck failed" >&2
    exit 1
  fi
done

echo "[4/4] Done"
echo "Open: http://localhost"
