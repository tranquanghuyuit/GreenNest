param(
  [switch]$Cluster
)

$ErrorActionPreference = "Stop"

function Get-KubescapeCommand {
  $command = Get-Command kubescape -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $localPath = Join-Path $HOME ".kubescape/kubescape.exe"
  if (Test-Path $localPath) {
    return $localPath
  }

  return $null
}

function Ensure-Kubescape {
  $kubescapeCommand = Get-KubescapeCommand
  if ($kubescapeCommand) {
    return $kubescapeCommand
  }

  Write-Host "Kubescape CLI was not found. Installing with the official PowerShell installer..."
  Invoke-Expression (Invoke-WebRequest -UseBasicParsing https://raw.githubusercontent.com/kubescape/kubescape/master/install.ps1)

  $kubescapeCommand = Get-KubescapeCommand
  if (-not $kubescapeCommand) {
    throw "Kubescape was installed, but the executable was not found in PATH or $HOME/.kubescape."
  }

  return $kubescapeCommand
}

function Invoke-KubescapeScan {
  param(
    [string]$Name,
    [string]$Framework,
    [string[]]$Arguments,
    [string]$KubescapeCommand
  )

  $reportPath = "kubescape-reports/$Name-$Framework.json"
  Write-Host ""
  Write-Host "Running Kubescape $Framework scan for $Name..."
  & $KubescapeCommand scan framework $Framework @Arguments --format json --format-version v2 --output $reportPath

  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Kubescape reported findings or returned a non-zero exit code for $Name/$Framework. Report: $reportPath"
  } else {
    Write-Host "Kubescape report created: $reportPath"
  }
}

$kubescapeCommand = Ensure-Kubescape
New-Item -ItemType Directory -Force kubescape-reports | Out-Null

Invoke-KubescapeScan -Name "app-manifests" -Framework "nsa" -Arguments @("deploy/kubernetes/manifests") -KubescapeCommand $kubescapeCommand
Invoke-KubescapeScan -Name "app-manifests" -Framework "mitre" -Arguments @("deploy/kubernetes/manifests") -KubescapeCommand $kubescapeCommand
Invoke-KubescapeScan -Name "monitoring-manifests" -Framework "nsa" -Arguments @("deploy/kubernetes/manifests-monitoring") -KubescapeCommand $kubescapeCommand
Invoke-KubescapeScan -Name "monitoring-manifests" -Framework "mitre" -Arguments @("deploy/kubernetes/manifests-monitoring") -KubescapeCommand $kubescapeCommand

if ($Cluster) {
  Invoke-KubescapeScan -Name "cluster-greennest" -Framework "nsa" -Arguments @("--include-namespaces", "greennest") -KubescapeCommand $kubescapeCommand
  Invoke-KubescapeScan -Name "cluster-greennest" -Framework "mitre" -Arguments @("--include-namespaces", "greennest") -KubescapeCommand $kubescapeCommand
}

Write-Host ""
Write-Host "Kubescape scans finished. Reports are in kubescape-reports/."
