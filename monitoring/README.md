# Monitoring

Thư mục này chứa cấu hình monitoring dùng để vận hành hệ thống.

Các thành phần chính:

- `prometheus/`: cấu hình scrape metrics và alert rules.
- `grafana/`: cấu hình Grafana datasource, provisioning và dashboards.
- `alertmanager/`: cấu hình cảnh báo.

Phân biệt với `graphs/`: `monitoring/` là cấu hình runtime để chạy Prometheus/Grafana/Alertmanager, còn `graphs/` dùng để lưu dashboard mẫu hoặc script tạo dashboard theo phong cách demo.
