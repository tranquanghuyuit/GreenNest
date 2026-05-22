#!/usr/bin/env bash
set -euo pipefail

echo "Installing NeuVector into namespace greennest with Helm..."
helm repo add neuvector https://neuvector.github.io/neuvector-helm/ --force-update
helm repo update

upgrade_args=(
  upgrade
  --install
  neuvector
  neuvector/core
  --namespace
  greennest
  --create-namespace
  -f
  deploy/kubernetes/manifests-policy/neuvector/values-dev.yaml
)

if helm upgrade --help | grep -q -- "--server-side"; then
  upgrade_args+=(--server-side=false)
fi

helm "${upgrade_args[@]}"

cat <<'EOF'

NeuVector install command completed.
Check pods:
  kubectl get pods -n greennest | grep neuvector

If the Web UI service exists, inspect it with:
  kubectl get svc -n greennest | grep neuvector
EOF
