# GreenNest DevSecOps Microservices Shop

Dự án môn học xây dựng website thương mại điện tử mini theo kiến trúc Microservices, có DevSecOps pipeline, containerization, Kubernetes deployment, GitOps CD, monitoring và security scanning.

## Tài Liệu Quan Trọng

- `docs/requirements.md`: yêu cầu hệ thống.
- `docs/database.md`: thiết kế cơ sở dữ liệu.
- `docs/workflow.md`: luồng hoạt động giữa frontend, API Gateway và các service.
- `docs/devsecops-pipeline.md`: pipeline DevSecOps.
- `docs/dockerhub-cd.md`: luồng CD Docker Hub + Argo CD.
- `docs/file-structure.md`: cấu trúc thư mục.
- `docs/threat-model.md`: mô hình rủi ro bảo mật.
- `docs/progress-log.md`: nhật ký phát triển dự án.

## Chạy Local Bằng Docker Compose

```powershell
docker compose -f deploy/docker-compose/docker-compose.yml up -d --build
```

Frontend local:

```text
http://localhost:8080
```

API Gateway:

```text
http://localhost:4000/health
```

## Chạy Kubernetes Local

Build image local:

```powershell
docker compose -f deploy/docker-compose/docker-compose.yml build
```

Apply manifest:

```powershell
kubectl apply -k deploy/kubernetes/manifests
```

Kiểm tra:

```powershell
kubectl get pods -n greennest
```

## Argo CD

Cài Argo CD và apply GreenNest Application:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-argocd.ps1
```

Kiểm tra:

```powershell
kubectl get applications -n argocd
```

## NGINX Ingress

Cài NGINX Ingress Controller:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-nginx-ingress.ps1
```

Thêm vào hosts file:

```text
127.0.0.1 greennest.local
```

Mở:

```text
http://greennest.local
```

## CD Docker Hub

Workflow `.github/workflows/cd-dockerhub.yml` sẽ build/push image lên Docker Hub sau khi CI xanh trên `main`, sau đó cập nhật manifest để Argo CD sync vào Kubernetes.

Cần tạo GitHub Secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

Chi tiết xem `docs/dockerhub-cd.md`.
