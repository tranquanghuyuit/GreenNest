# Scripts

Chứa script tiện ích cho CI, local setup và kiểm tra hệ thống.

## Script hiện có

```text
scripts/
  install-argocd.ps1
  install-argocd.sh
  install-k8s-monitoring.ps1
  install-k8s-monitoring.sh
  install-neuvector.ps1
  install-neuvector.sh
  install-nginx-ingress.ps1
  install-nginx-ingress.sh
  ci/
    smoke-test.sh
```

- `install-argocd.ps1`: cài Argo CD, chờ pod sẵn sàng và apply GreenNest Application bằng PowerShell.
- `install-argocd.sh`: cài Argo CD, chờ pod sẵn sàng và apply GreenNest Application bằng Bash.
- `install-k8s-monitoring.ps1`: cài Prometheus, Grafana, Alertmanager, Blackbox Exporter và Jaeger vào namespace `greennest`.
- `install-k8s-monitoring.sh`: bản Bash của script cài Kubernetes monitoring.
- `install-neuvector.ps1`: cài NeuVector bằng Helm vào namespace `greennest`.
- `install-neuvector.sh`: bản Bash của script cài NeuVector.
- `install-nginx-ingress.ps1`: cài NGINX Ingress Controller trên Kubernetes bằng PowerShell.
- `install-nginx-ingress.sh`: cài NGINX Ingress Controller trên Kubernetes bằng Bash.
- `ci/smoke-test.sh`: smoke test API/frontend sau khi Docker Compose stack chạy trong CI.
