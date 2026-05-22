#!/usr/bin/env bash
set -euo pipefail

echo "Installing NeuVector into namespace greennest with Helm..."
helm repo add neuvector https://neuvector.github.io/neuvector-helm/
helm repo update

helm upgrade --install neuvector neuvector/core \
  --namespace greennest \
  --create-namespace \
  -f deploy/kubernetes/manifests-policy/neuvector/values-dev.yaml

cat <<'EOF'

NeuVector install command completed.
Check pods:
  kubectl get pods -n greennest | grep neuvector

If the Web UI service exists, inspect it with:
  kubectl get svc -n greennest | grep neuvector
EOF
