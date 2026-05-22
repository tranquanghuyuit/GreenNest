#!/usr/bin/env bash
set -euo pipefail

echo "Applying GreenNest Kubernetes monitoring stack into namespace greennest..."
kubectl apply -k deploy/kubernetes/manifests-monitoring

echo "Waiting for monitoring deployments..."
for deployment in prometheus alertmanager blackbox-exporter grafana jaeger; do
  kubectl rollout status "deployment/${deployment}" -n greennest --timeout=180s
done

cat <<'EOF'

Monitoring stack is ready.
Open UIs with:
  kubectl port-forward svc/grafana -n greennest 3000:3000
  kubectl port-forward svc/prometheus -n greennest 9090:9090
  kubectl port-forward svc/jaeger -n greennest 16686:16686
EOF
