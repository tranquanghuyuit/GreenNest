#!/usr/bin/env bash
set -euo pipefail

CONTROLLER_VERSION="${INGRESS_NGINX_VERSION:-controller-v1.15.1}"
MANIFEST_URL="https://raw.githubusercontent.com/kubernetes/ingress-nginx/${CONTROLLER_VERSION}/deploy/static/provider/cloud/deploy.yaml"

echo "Installing NGINX Ingress Controller from ${MANIFEST_URL}"
kubectl apply -f "${MANIFEST_URL}"

echo "Waiting for NGINX Ingress Controller pod..."
kubectl wait \
  --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s

kubectl get service ingress-nginx-controller -n ingress-nginx
