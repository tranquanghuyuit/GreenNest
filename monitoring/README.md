# Monitoring

Thư mục này chứa cấu hình monitoring runtime cho hệ thống GreenNest.

## Thành phần

- `prometheus/`: cấu hình scrape metrics, HTTP probe và alert rules.
- `grafana/`: cấu hình datasource, dashboard provisioning và dashboard JSON.
- `alertmanager/`: cấu hình nhận alert từ Prometheus.

Monitoring local được chạy bằng compose overlay:

```bash
docker compose -f deploy/docker-compose/docker-compose.yml -f deploy/docker-compose/docker-compose.monitoring.yml up -d --build
```

## URL local

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` với tài khoản `admin` / `admin`
- Alertmanager: `http://localhost:9093`
- Jaeger UI: `http://localhost:16686`
- cAdvisor: `http://localhost:8081`
- Node Exporter metrics: `http://localhost:9100/metrics`
- Blackbox Exporter: `http://localhost:9115`

## Luồng giám sát

```text
Prometheus
  |-- scrape Blackbox Exporter để kiểm tra frontend/API/service health
  |-- scrape cAdvisor để lấy metric container
  |-- scrape Node Exporter để lấy metric host
  |-- scrape Jaeger admin metrics
  |-- gửi alert sang Alertmanager

Grafana
  |-- đọc datasource Prometheus
  |-- đọc datasource Jaeger
  |-- load dashboard GreenNest Overview
```

Phân biệt với `graphs/`: `monitoring/` là cấu hình runtime để chạy Prometheus/Grafana/Alertmanager, còn `graphs/` dùng để lưu dashboard mẫu hoặc script tạo dashboard theo phong cách demo.
