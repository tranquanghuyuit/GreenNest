# Argo CD

Thư mục này chứa manifest Argo CD Application cho môi trường dev.

## Luồng GitOps

```text
GitHub repo
  -> Argo CD Application
  -> sync deploy/kubernetes/manifests
  -> Kubernetes namespace greennest
```

## Cài Argo CD local

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=180s
```

Mở UI:

```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443
```

Lấy mật khẩu admin ban đầu:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

Apply app:

```bash
kubectl apply -f deploy/kubernetes/argocd/application-dev.yaml
```

Sau đó Argo CD sẽ sync manifest từ GitHub path `deploy/kubernetes/manifests`.
