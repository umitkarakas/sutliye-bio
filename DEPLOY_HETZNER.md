## Hetzner deployment

Bu proje Hetzner üzerinde Docker + Coolify orkestrasyonu ile çalışır.
Production source of truth budur.

## Canlı yüzeyler

- Kaynak checkout: `/opt/apps/kebapci-menu`
- Coolify service metadata: `/data/coolify/services/g137qahmvabtmcz51hvqo1zj`
- Container adı: `kebapci-menu`
- Host bind: `127.0.0.1:3010 -> 3000`
- Public domain: `https://01.qrbir.com`

`https://mnu.qrbir.com` bu uygulamanin aktif production domain'i degildir.

Kaynak repo yüzeyi yalnızca `/opt/apps/kebapci-menu` olarak kabul edilmelidir. `/data/coolify/services/...` generated orkestrasyon alanıdır.

## Ortam dosyası

Canlı deploy `.env.production` değil `.env` kullanır.

Temel gerekli değişkenler:

- `DATABASE_URL`
- `APP_BASE_URL=https://01.qrbir.com`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` opsiyonel

`DIRECT_URL` opsiyoneldir; tanımlı değilse Prisma ve operasyon scriptleri `DATABASE_URL` ile çalışır. `.env.example` referans olarak kullanılabilir, fakat canlı dosya adı `.env` olmalıdır.

## Compose gerçekliği

Canlı compose yüzeyi repo kökündeki `docker-compose.yml` ile uyumludur:

- `env_file: .env`
- yalnızca `127.0.0.1:3010:3000` bind edilir
- `platform-db` external Docker network kullanılır
- healthcheck tanımlıdır

Deploy:

```bash
cd /opt/apps/kebapci-menu
git pull origin main
docker compose up -d --build
```

Sunucuda yardımcı deploy script'i de bulunur:

```bash
/opt/apps/kebapci-menu/deploy.sh
```

Bu script `git pull`, `docker compose up -d --build`, healthcheck ve metadata güncellemesini aynı akışta yapar.

## Reverse proxy

Public ingress yalnızca OpenLiteSpeed/CyberPanel katmanından gelmelidir. Container portu internete doğrudan açılmamalıdır.

## Cloudflare notu

Repo içinde bulunan `cf:build`, `preview` ve `deploy:cloudflare` komutları yardımcı yüzeydir. Production deploy kararı veya ana canlı yüzey olarak yorumlanmamalıdır.

## Git deploy izlenebilirliği

Canlı checkout `main` branch'ini izler. Deploy metadata iki yerde tutulur:

- `/opt/apps/kebapci-menu/DEPLOY_SOURCE.json`
- `/data/coolify/services/g137qahmvabtmcz51hvqo1zj/DEPLOY_SOURCE.json`

`DEPLOY_SOURCE.json` operasyon dosyasıdır; sunucu checkout'unda local git exclude ile saklanır.
Canli commit/zaman bilgisi tracked `manifest.json` icine yazilmamali; bu bilgi yalniz `DEPLOY_SOURCE.json` tarafinda tutulmalidir.

Drift kontrolünde su alanlar birlikte okunmalıdır:

- `/opt/apps/kebapci-menu/manifest.json`
- `/opt/apps/kebapci-menu/DEPLOY_SOURCE.json`
- `/data/coolify/services/g137qahmvabtmcz51hvqo1zj/DEPLOY_SOURCE.json`
- `docker ps`
- `curl -sI http://127.0.0.1:3010`
- `curl -skI https://01.qrbir.com`

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
- public domain `https://01.qrbir.com` `200 OK`
