## Hetzner deployment

Bu proje Hetzner üzerinde Docker + Coolify orkestrasyonu ile çalışır.

## Canlı yüzeyler

- Kaynak checkout: `/opt/apps/kebapci-menu`
- Coolify service metadata: `/data/coolify/services/g137qahmvabtmcz51hvqo1zj`
- Container adı: `kebapci-menu-g137qahmvabtmcz51hvqo1zj`
- Host bind: `127.0.0.1:3010 -> 3000`
- Public domain: `https://01.qrbir.com`

Kaynak repo yüzeyi yalnızca `/opt/apps/kebapci-menu` olarak kabul edilmelidir. `/data/coolify/services/...` generated orkestrasyon alanıdır.

## Ortam dosyası

Canlı deploy `.env.production` değil `.env` kullanır.

Temel gerekli değişkenler:

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_BASE_URL=https://01.qrbir.com`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` opsiyonel

`.env.example` referans olarak kullanılabilir, fakat canlı dosya adı `.env` olmalıdır.

## Compose gerçekliği

Canlı compose yüzeyi repo kökündeki `docker-compose.yml` ile uyumludur:

- `env_file: .env`
- yalnızca `127.0.0.1:3010:3000` bind edilir
- `platform-db` external Docker network kullanılır
- healthcheck tanımlıdır

Deploy:

```bash
docker compose up -d --build
```

## Reverse proxy

Public ingress yalnızca OpenLiteSpeed/CyberPanel katmanından gelmelidir. Container portu internete doğrudan açılmamalıdır.

## Git deploy izlenebilirliği

Canlı checkout `main` branch'ini izler. Deploy metadata iki yerde tutulur:

- `/opt/apps/kebapci-menu/DEPLOY_SOURCE.json`
- `/data/coolify/services/g137qahmvabtmcz51hvqo1zj/DEPLOY_SOURCE.json`

`DEPLOY_SOURCE.json` operasyon dosyasıdır; sunucu checkout'unda local git exclude ile saklanır.

Canlı durum doğrulama komutları:

```bash
cd /opt/apps/kebapci-menu
git status --short --branch
git rev-parse HEAD
docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}' | grep kebapci-menu
curl -sI http://127.0.0.1:3010 | sed -n '1,10p'
```

Beklenen durum:

- `git status` temiz
- branch: `main...origin/main`
- container healthy
- lokal HTTP kontrolü `200 OK`
