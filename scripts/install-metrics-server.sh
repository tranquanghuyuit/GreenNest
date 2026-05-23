#!/usr/bin/env bash
set -euo pipefail

echo "Installing metrics-server for local Kubernetes HPA..."

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

container_args="$(kubectl get deployment metrics-server -n kube-system -o jsonpath='{.spec.template.spec.containers[0].args}')"
if [[ "$container_args" != *"--kubelet-insecure-tls"* ]]; then
  kubectl patch deployment metrics-server -n kube-system --type=strategic -p='{"spec":{"template":{"spec":{"containers":[{"name":"metrics-server","args":["--cert-dir=/tmp","--secure-port=10250","--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname","--kubelet-use-node-status-port","--metric-resolution=15s","--kubelet-insecure-tls"]}]}}}}'
fi

kubectl rollout status deployment/metrics-server -n kube-system --timeout=180s

echo ""
echo "metrics-server is ready."
echo "Check node metrics:"
echo "  kubectl top nodes"
echo ""
echo "Check HPA:"
echo "  kubectl get hpa -n greennest"
