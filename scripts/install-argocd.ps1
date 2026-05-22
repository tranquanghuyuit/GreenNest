$ErrorActionPreference = "Stop"

$ArgoCdVersion = $env:ARGOCD_VERSION
if ([string]::IsNullOrWhiteSpace($ArgoCdVersion)) {
  $ArgoCdVersion = "stable"
}

$ManifestUrl = "https://raw.githubusercontent.com/argoproj/argo-cd/$ArgoCdVersion/manifests/install.yaml"

Write-Host "Creating argocd namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

Write-Host "Installing Argo CD from $ManifestUrl"
kubectl apply -n argocd --server-side --force-conflicts -f $ManifestUrl

Write-Host "Waiting for Argo CD pods..."
kubectl wait `
  --namespace argocd `
  --for=condition=ready pod `
  --all `
  --timeout=300s

Write-Host "Applying GreenNest Argo CD Application..."
kubectl apply -f deploy/kubernetes/argocd/application-dev.yaml

Write-Host ""
Write-Host "Argo CD is installed."
Write-Host "Open UI with:"
Write-Host "  kubectl port-forward svc/argocd-server -n argocd 8081:443"
Write-Host ""
Write-Host "Username:"
Write-Host "  admin"
Write-Host ""
Write-Host "Initial password:"
Write-Host '  kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d'
Write-Host ""
Write-Host "Check app:"
Write-Host "  kubectl get applications -n argocd"
