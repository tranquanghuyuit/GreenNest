# Scripts

Chứa script tiện ích cho CI, local setup và kiểm tra hệ thống.

## Script hiện có

```text
scripts/
  install-argocd.ps1
  install-argocd.sh
  install-nginx-ingress.ps1
  install-nginx-ingress.sh
  ci/
    smoke-test.sh
```

- `install-argocd.ps1`: cài Argo CD, chờ pod sẵn sàng và apply GreenNest Application bằng PowerShell.
- `install-argocd.sh`: cài Argo CD, chờ pod sẵn sàng và apply GreenNest Application bằng Bash.
- `install-nginx-ingress.ps1`: cài NGINX Ingress Controller trên Kubernetes bằng PowerShell.
- `install-nginx-ingress.sh`: cài NGINX Ingress Controller trên Kubernetes bằng Bash.
- `ci/smoke-test.sh`: smoke test API/frontend sau khi Docker Compose stack chạy trong CI.
