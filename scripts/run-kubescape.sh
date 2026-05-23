#!/usr/bin/env bash
set -u

run_cluster=false
if [ "${1:-}" = "--cluster" ]; then
  run_cluster=true
fi

ensure_kubescape() {
  if command -v kubescape >/dev/null 2>&1; then
    return
  fi

  echo "Kubescape CLI was not found. Installing with the official installer..."
  curl -s https://raw.githubusercontent.com/kubescape/kubescape/master/install.sh | /bin/bash
}

run_scan() {
  local name="$1"
  local framework="$2"
  shift 2
  local report_path="kubescape-reports/${name}-${framework}.json"

  echo ""
  echo "Running Kubescape ${framework} scan for ${name}..."
  if kubescape scan framework "$framework" "$@" --format json --format-version v2 --output "$report_path"; then
    echo "Kubescape report created: ${report_path}"
  else
    echo "Warning: Kubescape reported findings or returned a non-zero exit code for ${name}/${framework}. Report: ${report_path}"
  fi
}

ensure_kubescape
mkdir -p kubescape-reports

run_scan "app-manifests" "nsa" "deploy/kubernetes/manifests"
run_scan "app-manifests" "mitre" "deploy/kubernetes/manifests"
run_scan "monitoring-manifests" "nsa" "deploy/kubernetes/manifests-monitoring"
run_scan "monitoring-manifests" "mitre" "deploy/kubernetes/manifests-monitoring"

if [ "$run_cluster" = true ]; then
  run_scan "cluster-greennest" "nsa" "--include-namespaces" "greennest"
  run_scan "cluster-greennest" "mitre" "--include-namespaces" "greennest"
fi

echo ""
echo "Kubescape scans finished. Reports are in kubescape-reports/."
