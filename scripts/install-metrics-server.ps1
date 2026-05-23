$ErrorActionPreference = "Stop"

Write-Host "Installing metrics-server for local Kubernetes HPA..."

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

$containerArgs = kubectl get deployment metrics-server -n kube-system -o jsonpath="{.spec.template.spec.containers[0].args}"
if ($containerArgs -notmatch "--kubelet-insecure-tls") {
  $patch = @'
{"spec":{"template":{"spec":{"containers":[{"name":"metrics-server","args":["--cert-dir=/tmp","--secure-port=10250","--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname","--kubelet-use-node-status-port","--metric-resolution=15s","--kubelet-insecure-tls"]}]}}}}
'@
  $patchPath = Join-Path $env:TEMP "metrics-server-patch.json"
  Set-Content -Path $patchPath -Value $patch -NoNewline
  kubectl patch deployment metrics-server -n kube-system --type=strategic --patch-file $patchPath
}

kubectl rollout status deployment/metrics-server -n kube-system --timeout=180s

Write-Host ""
Write-Host "metrics-server is ready."
Write-Host "Check node metrics:"
Write-Host "  kubectl top nodes"
Write-Host ""
Write-Host "Check HPA:"
Write-Host "  kubectl get hpa -n greennest"
