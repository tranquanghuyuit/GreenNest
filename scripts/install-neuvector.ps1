$ErrorActionPreference = "Stop"

Write-Host "Installing NeuVector into namespace greennest with Helm..."
helm repo add neuvector https://neuvector.github.io/neuvector-helm/ --force-update
if ($LASTEXITCODE -ne 0) { throw "helm repo add failed" }

helm repo update
if ($LASTEXITCODE -ne 0) { throw "helm repo update failed" }

$upgradeArgs = @(
  "upgrade",
  "--install",
  "neuvector",
  "neuvector/core",
  "--namespace",
  "greennest",
  "--create-namespace",
  "-f",
  "deploy/kubernetes/manifests-policy/neuvector/values-dev.yaml"
)

$upgradeHelp = helm upgrade --help
if ($upgradeHelp -match "--server-side") {
  $upgradeArgs += "--server-side=false"
}

helm @upgradeArgs
if ($LASTEXITCODE -ne 0) { throw "helm upgrade failed" }

Write-Host ""
Write-Host "NeuVector install command completed."
Write-Host "Check pods:"
Write-Host "  kubectl get pods -n greennest | findstr neuvector"
Write-Host ""
Write-Host "If the Web UI service exists, port-forward it with:"
Write-Host "  kubectl get svc -n greennest | findstr neuvector"
