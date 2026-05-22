# NeuVector

NeuVector dùng để kiểm soát bảo mật runtime trong Kubernetes:

- quan sát network giữa pod.
- quét image/container runtime.
- phát hiện CVE.
- tạo policy bảo mật cho workload.
- hỗ trợ demo phần runtime security trong DevSecOps.

Trong GreenNest, NeuVector được cài bằng Helm vào namespace `greennest` để đúng yêu cầu demo namespace của dự án.

## Cài bằng script

PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-neuvector.ps1
```

Bash:

```bash
bash scripts/install-neuvector.sh
```

## Cài thủ công

```bash
helm repo add neuvector https://neuvector.github.io/neuvector-helm/
helm repo update

helm upgrade --install neuvector neuvector/core \
  --namespace greennest \
  --create-namespace \
  -f deploy/kubernetes/manifests-policy/neuvector/values-dev.yaml
```

Kiểm tra:

```bash
kubectl get pods -n greennest | grep neuvector
kubectl get svc -n greennest | grep neuvector
```

## Lưu ý

NeuVector nặng hơn Prometheus/Grafana/Jaeger và thường cần cluster đủ RAM/CPU. Nếu Docker Desktop Kubernetes yếu, nên demo Prometheus/Grafana/Jaeger trước, sau đó mới bật NeuVector.
