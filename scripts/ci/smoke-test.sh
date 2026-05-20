#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error http://localhost:4000/health >/dev/null
curl --fail --silent --show-error http://localhost:4000/api/products?limit=1 >/dev/null
curl --fail --silent --show-error http://localhost:8080 >/dev/null
curl --fail --silent --show-error http://localhost:8080/api/products?limit=1 >/dev/null

echo "Smoke test passed: API Gateway, Product API, frontend and frontend /api proxy are reachable."
