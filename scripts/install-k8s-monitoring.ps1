$ErrorActionPreference = "Stop"

Write-Host "Applying GreenNest Kubernetes monitoring stack into namespace greennest..."
kubectl apply -k deploy/kubernetes/manifests-monitoring

Write-Host "Waiting for monitoring deployments..."
$deployments = @(
  "prometheus",
  "alertmanager",
  "blackbox-exporter",
  "grafana",
  "jaeger"
)

foreach ($deployment in $deployments) {
  kubectl rollout status "deployment/$deployment" -n greennest --timeout=180s
}

Write-Host ""
Write-Host "Monitoring stack is ready."
Write-Host "Open UIs with:"
Write-Host "  kubectl port-forward svc/grafana -n greennest 3000:3000"
Write-Host "  kubectl port-forward svc/prometheus -n greennest 9090:9090"
Write-Host "  kubectl port-forward svc/jaeger -n greennest 16686:16686"
