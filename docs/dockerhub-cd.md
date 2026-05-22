# Docker Hub CD

File này ghi chú luồng CD tự động bằng Docker Hub và Argo CD.

## Mục tiêu

Sau khi code được push lên `main`, hệ thống tự:

```text
CI kiểm tra code
  -> build Docker image
  -> push image lên Docker Hub
  -> cập nhật Kubernetes manifest
  -> Argo CD sync manifest mới
  -> Kubernetes pull image mới từ Docker Hub
```

## Workflow

Workflow chính:

```text
.github/workflows/cd-dockerhub.yml
```

Trigger:

- Tự chạy khi workflow `CI` hoàn thành thành công trên branch `main`.
- Có thể chạy tay bằng `workflow_dispatch`.

## Image name

Mỗi service được push thành một Docker Hub repository riêng:

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

Workflow cũng push thêm tag `latest` cho từng image, nhưng Kubernetes manifest dùng tag theo commit SHA để biết chính xác đang chạy bản nào.

## GitHub Secrets cần tạo

Cần tạo 2 repository secrets trong GitHub:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

Không dùng mật khẩu Docker Hub thật trong code. Dùng Docker Hub access token.

## Cách tạo Docker Hub access token

1. Vào Docker Hub.
2. Vào `Account settings`.
3. Chọn `Personal access tokens`.
4. Tạo token mới.
5. Quyền nên chọn `Read & Write`.
6. Copy token ngay lúc tạo, vì Docker Hub chỉ hiện token một lần.

## Cách thêm secret vào GitHub

Vào repo GitHub:

```text
Settings
  -> Secrets and variables
  -> Actions
  -> New repository secret
```

Thêm:

```text
Name: DOCKERHUB_USERNAME
Value: username Docker Hub của bạn
```

Thêm tiếp:

```text
Name: DOCKERHUB_TOKEN
Value: access token Docker Hub
```

## Luồng với Argo CD

Sau khi image push lên Docker Hub, workflow sẽ sửa image trong:

```text
deploy/kubernetes/manifests/*.yaml
```

Rồi commit lại lên `main` với message có `[skip ci]`.

Argo CD đang theo dõi path:

```text
deploy/kubernetes/manifests
```

Khi thấy manifest đổi, Argo CD tự sync vào Kubernetes. Kubernetes sau đó pull image mới từ Docker Hub.

## Lưu ý

- Nếu Docker Hub repository là private, Kubernetes cần thêm `imagePullSecret`.
- Để demo đơn giản, nên để repository Docker Hub public.
- Nếu Docker Hub báo `requested access denied`, kiểm tra lại username, token hoặc tạo trước các repository `greennest-*` trên Docker Hub.
