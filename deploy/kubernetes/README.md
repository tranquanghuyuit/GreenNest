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
  manifests-monitoring/
  manifests-logging/
```

## Luồng Kubernetes

```text
Browser
  -> NGINX Ingress Controller
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
kubectl get ingress -n greennest
```

Nếu chưa dùng Ingress Controller, có thể port-forward frontend:

```bash
kubectl port-forward svc/frontend -n greennest 8080:8080
```

Sau đó mở:

```text
http://localhost:8080
```

## NGINX Ingress Controller

`manifests/ingress.yaml` chỉ mô tả luật route:

```text
greennest.local/     -> frontend Service
greennest.local/api  -> api-gateway Service
```

Để luật này chạy thật, cluster cần có một Ingress Controller. Trong môi trường demo này dùng NGINX Ingress Controller.

Cài controller trên Docker Desktop Kubernetes:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-nginx-ingress.ps1
```

Hoặc trên Bash:

```bash
bash scripts/install-nginx-ingress.sh
```

Sau đó apply app:

```bash
kubectl apply -k deploy/kubernetes/manifests
kubectl get ingress -n greennest
```

Thêm dòng sau vào hosts file của máy:

```text
127.0.0.1 greennest.local
```

Trên Windows, mở Notepad bằng quyền Administrator rồi sửa:

```text
C:\Windows\System32\drivers\etc\hosts
```

Sau đó mở:

```text
http://greennest.local
```

Khi có cloud thật, LoadBalancer/Ingress Controller sẽ nhận IP public hoặc DNS public. Khi đó user không cần port-forward từng service nữa.

## Chạy bằng Argo CD

Argo CD manifest nằm ở:

```text
deploy/kubernetes/argocd/application-dev.yaml
```

Hoàn thiện Argo CD local bằng script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-argocd.ps1
```

Hoặc trên Bash:

```bash
bash scripts/install-argocd.sh
```

Script sẽ cài Argo CD vào namespace `argocd`, chờ pod sẵn sàng và apply Application:

```bash
kubectl apply -f deploy/kubernetes/argocd/application-dev.yaml
```

Argo CD sẽ tự sync path:

```text
deploy/kubernetes/manifests
```

Mở Argo CD UI:

```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443
```

Sau đó vào:

```text
https://localhost:8081
```

## Lưu ý quan trọng

- Manifest hiện dùng image local `devsecops-shop/*:dev`.
- Khi làm CD thật, cần push image lên GHCR rồi đổi image thành `ghcr.io/...`.
- `dev-secrets.yaml` chỉ dùng cho môi trường dev/demo, không dùng làm secret production.
- PostgreSQL trong manifest là StatefulSet dev. Production nên dùng managed database hoặc PostgreSQL operator.
