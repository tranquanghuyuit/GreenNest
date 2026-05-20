# NeuVector

NeuVector dùng để kiểm soát bảo mật runtime trong Kubernetes: quét image, phát hiện CVE, quan sát network giữa pod, policy và runtime threat.

Trong project này, NeuVector không chạy bằng Docker Compose local. Nó nên được cài vào Kubernetes cluster bằng Helm sau khi có cluster dev/staging/production.

## Cài thử trên Kubernetes

```bash
helm repo add neuvector https://neuvector.github.io/neuvector-helm/
helm repo update
kubectl create namespace cattle-neuvector-system
helm upgrade --install neuvector neuvector/core \
  --namespace cattle-neuvector-system \
  -f deploy/kubernetes/manifests-policy/neuvector/values-dev.yaml
```

Sau khi cài, kiểm tra:

```bash
kubectl get pods -n cattle-neuvector-system
kubectl get svc -n cattle-neuvector-system
```

NeuVector UI sẽ được expose bằng service của manager. Với môi trường local như Minikube hoặc Kind, có thể cần `kubectl port-forward` hoặc đổi service type theo cluster đang dùng.
