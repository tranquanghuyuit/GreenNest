$ErrorActionPreference = "Stop"

Write-Host "Installing NeuVector into namespace greennest with Helm..."
helm repo add neuvector https://neuvector.github.io/neuvector-helm/
helm repo update

helm upgrade --install neuvector neuvector/core `
  --namespace greennest `
  --create-namespace `
  -f deploy/kubernetes/manifests-policy/neuvector/values-dev.yaml

Write-Host ""
Write-Host "NeuVector install command completed."
Write-Host "Check pods:"
Write-Host "  kubectl get pods -n greennest | findstr neuvector"
Write-Host ""
Write-Host "If the Web UI service exists, port-forward it with:"
Write-Host "  kubectl get svc -n greennest | findstr neuvector"
