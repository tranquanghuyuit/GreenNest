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
    hpa.yaml
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

## Monitoring Kubernetes

Monitoring Kubernetes của GreenNest chạy trong namespace `greennest`.

Manifest nằm ở:

```text
deploy/kubernetes/manifests-monitoring
```

Argo CD Application tương ứng:

```text
deploy/kubernetes/argocd/application-monitoring-dev.yaml
```

Cài Prometheus, Grafana, Alertmanager, Blackbox Exporter và Jaeger:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-k8s-monitoring.ps1
```

Hoặc:

```bash
bash scripts/install-k8s-monitoring.sh
```

Mở giao diện:

```powershell
kubectl port-forward svc/grafana -n greennest 3000:3000
kubectl port-forward svc/prometheus -n greennest 9090:9090
kubectl port-forward svc/jaeger -n greennest 16686:16686
```

URL:

```text
Grafana:    http://localhost:3000    admin/admin
Prometheus: http://localhost:9090
Jaeger:     http://localhost:16686
```

Prometheus hiện dùng Blackbox Exporter để probe frontend, API Gateway và `/health` của từng service.

## Horizontal Pod Autoscaler

`manifests/hpa.yaml` cấu hình HPA cho:

```text
api-gateway:     min 2, max 5, target CPU 70%
frontend:        min 2, max 4, target CPU 70%
product-service: min 1, max 4, target CPU 70%
```

HPA cần metrics-server để đọc CPU/RAM:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-metrics-server.ps1
```

Kiểm tra:

```powershell
kubectl top nodes
kubectl get hpa -n greennest
kubectl describe hpa api-gateway -n greennest
```

Lưu ý: Docker Desktop chỉ có một node local, nên demo được HPA tăng/giảm pod, nhưng không demo được Cluster Autoscaler tăng node.

Cài NeuVector runtime security bằng Helm:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-neuvector.ps1
```

NeuVector nặng hơn các tool monitoring khác. Nếu Docker Desktop thiếu RAM, nên demo Prometheus/Grafana/Jaeger trước.
