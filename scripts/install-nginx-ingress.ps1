$ErrorActionPreference = "Stop"

$ControllerVersion = $env:INGRESS_NGINX_VERSION
if ([string]::IsNullOrWhiteSpace($ControllerVersion)) {
  $ControllerVersion = "controller-v1.15.1"
}

$ManifestUrl = "https://raw.githubusercontent.com/kubernetes/ingress-nginx/$ControllerVersion/deploy/static/provider/cloud/deploy.yaml"

Write-Host "Installing NGINX Ingress Controller from $ManifestUrl"
kubectl apply -f $ManifestUrl

Write-Host "Waiting for NGINX Ingress Controller pod..."
kubectl wait `
  --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=180s

kubectl get service ingress-nginx-controller -n ingress-nginx
