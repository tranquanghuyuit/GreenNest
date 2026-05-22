# Argo CD

Thư mục này chứa Argo CD Application cho môi trường dev.

## Argo CD dùng để làm gì?

Argo CD là công cụ GitOps CD. Nó theo dõi manifest Kubernetes trong GitHub và tự đồng bộ cluster về đúng trạng thái trong Git.

Luồng thủ công:

```text
Developer
  -> sửa manifest
  -> chạy kubectl apply -k deploy/kubernetes/manifests
  -> Kubernetes cập nhật app
```

Luồng GitOps:

```text
Developer
  -> push manifest lên GitHub
  -> Argo CD phát hiện Git thay đổi
  -> Argo CD sync deploy/kubernetes/manifests
  -> Kubernetes cập nhật app
```

## Application hiện tại

File chính:

```text
deploy/kubernetes/argocd/application-dev.yaml
```

File này khai báo:

- repo nguồn: `https://github.com/tranquanghuyuit/GreenNest.git`
- branch: `main`
- path manifest: `deploy/kubernetes/manifests`
- namespace deploy app: `greennest`
- sync tự động: bật `prune` và `selfHeal`

## Cài Argo CD local

Trên Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-argocd.ps1
```

Trên Bash:

```bash
bash scripts/install-argocd.sh
```

Script sẽ làm 3 việc:

```text
1. Tạo namespace argocd.
2. Cài Argo CD bằng manifest chính thức với server-side apply.
3. Apply GreenNest Application.
```

## Mở Argo CD UI

Port-forward Argo CD server:

```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443
```

Mở:

```text
https://localhost:8081
```

Trình duyệt có thể cảnh báo HTTPS self-signed certificate, chọn tiếp tục.

Tài khoản:

```text
username: admin
```

Lấy mật khẩu ban đầu:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

Trên PowerShell, nếu không có `base64 -d`, dùng:

```powershell
$password = kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}"
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($password))
```

## Kiểm tra trạng thái sync

```bash
kubectl get applications -n argocd
kubectl describe application greennest-dev -n argocd
```

Kỳ vọng:

```text
SYNC STATUS: Synced
HEALTH STATUS: Healthy
```

## CD bằng Docker Hub

Workflow `.github/workflows/cd-dockerhub.yml` hoàn thiện luồng CD theo Docker Hub:

```text
CI xanh trên main
  -> CD Docker Hub build image từng service
  -> push image lên Docker Hub
  -> cập nhật image tag trong deploy/kubernetes/manifests
  -> commit manifest mới lên main với [skip ci]
  -> Argo CD phát hiện Git thay đổi
  -> Argo CD sync manifest mới vào Kubernetes
  -> Kubernetes pull image mới từ Docker Hub
```

Image sẽ có dạng:

```text
docker.io/<dockerhub-username>/greennest-frontend:<commit-sha>
docker.io/<dockerhub-username>/greennest-api-gateway:<commit-sha>
docker.io/<dockerhub-username>/greennest-auth-service:<commit-sha>
docker.io/<dockerhub-username>/greennest-user-service:<commit-sha>
docker.io/<dockerhub-username>/greennest-product-service:<commit-sha>
docker.io/<dockerhub-username>/greennest-cart-service:<commit-sha>
docker.io/<dockerhub-username>/greennest-order-service:<commit-sha>
docker.io/<dockerhub-username>/greennest-payment-service:<commit-sha>
```

Cần thêm GitHub Secrets:

```text
DOCKERHUB_USERNAME=<username Docker Hub của bạn>
DOCKERHUB_TOKEN=<access token Docker Hub>
```

Không dùng mật khẩu Docker Hub trực tiếp trong code. Hãy tạo access token trong Docker Hub rồi lưu vào GitHub Actions Secrets.

## Lưu ý local và cloud

Hiện tại local Docker Desktop vẫn có thể chạy image local `devsecops-shop/*:dev`.

Khi CD Docker Hub chạy xong, manifest sẽ đổi sang image Docker Hub. Lúc đó Kubernetes sẽ pull image từ Docker Hub thay vì chỉ dựa vào image local.

Nếu Docker Hub repository để private, Kubernetes cần thêm `imagePullSecret`. Để demo môn học đơn giản, nên để các repository Docker Hub public.
