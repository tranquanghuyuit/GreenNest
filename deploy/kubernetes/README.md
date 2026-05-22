# Kubernetes

Thư mục này chứa cấu hình Kubernetes cho GreenNest.

## Cấu trúc

```text
deploy/kubernetes/
  manifests/
    kustomization.yaml
    namespace.yaml
    app-config.yaml
    dev-secrets.yaml
    postgres.yaml
    frontend.yaml
    api-gateway.yaml
    auth-service.yaml
    user-service.yaml
    product-service.yaml
    cart-service.yaml
    order-service.yaml
    payment-service.yaml
    ingress.yaml
    db-init/
  argocd/
    application-dev.yaml
  manifests-policy/
    neuvector/
```

## Luồng Kubernetes

```text
Browser
  -> Ingress greennest.local
  -> frontend Service
  -> api-gateway Service
  -> microservice Service
  -> PostgreSQL StatefulSet riêng của service
```

## Chạy local/dev bằng kubectl

Trước khi apply, cần build image local:

```bash
docker compose -f deploy/docker-compose/docker-compose.yml build
```

Nếu dùng Docker Desktop Kubernetes, cluster thường đọc được image local. Nếu dùng Minikube hoặc Kind, cần load image vào cluster trước.

Apply manifest:

```bash
kubectl apply -k deploy/kubernetes/manifests
```

Kiểm tra:

```bash
kubectl get pods -n greennest
kubectl get svc -n greennest
```

Nếu chưa có Ingress Controller, có thể port-forward frontend:

```bash
kubectl port-forward svc/frontend -n greennest 8080:8080
```

Sau đó mở:

```text
http://localhost:8080
```

Nếu có Nginx Ingress Controller, thêm vào hosts file:

```text
127.0.0.1 greennest.local
```

Rồi mở:

```text
http://greennest.local
```

## Chạy bằng Argo CD

Argo CD manifest nằm ở:

```text
deploy/kubernetes/argocd/application-dev.yaml
```

Sau khi cài Argo CD:

```bash
kubectl apply -f deploy/kubernetes/argocd/application-dev.yaml
```

Argo CD sẽ tự sync path:

```text
deploy/kubernetes/manifests
```

## Lưu ý quan trọng

- Manifest hiện dùng image local `devsecops-shop/*:dev`.
- Khi làm CD thật, cần push image lên GHCR rồi đổi image thành `ghcr.io/...`.
- `dev-secrets.yaml` chỉ dùng cho môi trường dev/demo, không dùng làm secret production.
- PostgreSQL trong manifest là StatefulSet dev. Production nên dùng managed database hoặc PostgreSQL operator.
