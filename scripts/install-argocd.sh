#!/usr/bin/env bash
set -euo pipefail

ARGOCD_VERSION="${ARGOCD_VERSION:-stable}"
MANIFEST_URL="https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"

echo "Creating argocd namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

echo "Installing Argo CD from ${MANIFEST_URL}"
kubectl apply -n argocd --server-side --force-conflicts -f "${MANIFEST_URL}"

echo "Waiting for Argo CD pods..."
kubectl wait \
  --namespace argocd \
  --for=condition=ready pod \
  --all \
  --timeout=300s

echo "Applying GreenNest Argo CD Application..."
kubectl apply -f deploy/kubernetes/argocd/application-dev.yaml
kubectl apply -f deploy/kubernetes/argocd/application-monitoring-dev.yaml

cat <<'EOF'

Argo CD is installed.
Open UI with:
  kubectl port-forward svc/argocd-server -n argocd 8081:443

Username:
  admin

Initial password:
  kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d

Check app:
  kubectl get applications -n argocd
EOF
