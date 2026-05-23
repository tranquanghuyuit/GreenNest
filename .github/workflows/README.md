# GitHub Actions Workflows

Chứa workflow CI, security scan và deploy cho GreenNest.

- `ci.yml`: build/test các app, quét bảo mật bằng CodeQL, Semgrep, Trivy, OWASP Dependency-Check, Kubescape, validate Docker Compose/Kubernetes và smoke test API.
- `cd-dockerhub.yml`: build image, push Docker Hub và cập nhật image tag trong Kubernetes manifest.

Kubescape trong CI dùng để scan Kubernetes manifests theo framework NSA/MITRE. Kết quả SARIF được upload thành artifact `kubescape-sarif-reports`.
