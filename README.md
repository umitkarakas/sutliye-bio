# kebapci-menu

QR ve bio-link trafiği için tasarlanmış mobil öncelikli restoran menü uygulaması. Public tarafta şube bilgileri ve menü gösterilir; aynı uygulama içindeki `/admin` alanında şube, kategori, ürün, fiyat ve temel analytics yönetilir.

## Stack

- Next.js App Router
- TypeScript
- Prisma + PostgreSQL
- Docker tabanlı Hetzner deploy
- Opsiyonel Cloudflare build/deploy komutları

## Gereksinimler

- Node.js 22+
- npm
- PostgreSQL

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm ci
```

2. Ortam dosyasını oluşturun:

```bash
cp .env.example .env
```

3. `.env` içindeki en az şu alanları doldurun:

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_BASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

`NEXT_PUBLIC_GA_MEASUREMENT_ID` opsiyoneldir. Seed sırasında `ADMIN_FULL_NAME` verilmezse varsayılan ad kullanılır.

4. Prisma client üretin ve veritabanını hazırlayın:

```bash
npm run prisma:generate
npm run db:deploy
```

Geliştirme ortamında migration üretmeniz gerekiyorsa `npm run db:migrate` kullanın.

5. Demo veriyi yüklemek isterseniz:

```bash
npm run db:seed
```

## Lokal Çalıştırma

Geliştirme sunucusu:

```bash
npm run dev
```

Production benzeri çalışma:

```bash
npm run build
npm run start
```

Uygulama varsayılan olarak Next.js üzerinde çalışır. Docker deploy yüzeyinde container iç portu `3000`, host bind adresi `127.0.0.1:3010` olarak kullanılır.

## Komutlar

- `npm run dev`: lokal geliştirme
- `npm run build`: production build
- `npm run start`: production server
- `npm run lint`: ESLint
- `npm run typecheck`: TypeScript kontrolü
- `npm run prisma:generate`: Prisma client üretimi
- `npm run prisma:validate`: Prisma schema doğrulaması
- `npm run db:migrate`: development migration oluşturma/uygulama
- `npm run db:deploy`: mevcut migration'ları uygulama
- `npm run db:push`: şemayı doğrudan veritabanına itme
- `npm run db:studio`: Prisma Studio
- `npm run db:seed`: demo veriyi yükleme
- `npm run docker:build`: lokal Docker image üretme
- `npm run cf:build`: OpenNext Cloudflare build
- `npm run preview`: Cloudflare preview
- `npm run deploy`: Cloudflare deploy

## Uygulama Yüzeyleri

Public:

- `/`: varsayılan şube ile iletişim ve menü tabları
- `/b/[branchSlug]`: şube odaklı açılış yüzeyi
- `/api/events`: anonim event toplama

Admin:

- `/admin/login`
- `/admin`
- `/admin/branding`
- `/admin/branches`
- `/admin/categories`
- `/admin/products`
- `/admin/pricing`
- `/admin/analytics`

Admin girişinin source of truth'ü şu anda `.env` içindeki kimlik bilgileridir. `admin_users` tablosu veri modeli içindedir ama login kararı vermez.

## Veri Modeli Özeti

- `Business`: işletme seviyesi marka ve iletişim bilgileri
- `Branch`: şube kayıtları ve çalışma saatleri
- `MenuCategory` / `Product`: menü yapısı
- `BranchProduct`: şube bazlı fiyat, stok ve görünürlük
- `AdminUser`: admin metadata
- `EventLog`: anonim analytics olayları
- `Feedback`: geri bildirim kayıtları

## Repo Yapısı

- `app/`: App Router sayfaları ve route handler'lar
- `components/`: public ve admin arayüz bileşenleri
- `lib/`: auth, DB, generated Prisma ve server yardımcıları
- `prisma/`: schema ve seed
- `scripts/`: operasyonel yardımcı script'ler
- `Dockerfile`, `docker-compose.yml`: container deploy yüzeyi

## Deploy Notları

Hetzner/Coolify canlı checkout yüzeyi `/opt/apps/kebapci-menu` olarak normalize edilmiştir. Orkestrasyon metadata'sı `/data/coolify/services/<service-uuid>` altında tutulur; bu dizin kaynak repo gibi kullanılmamalıdır.

Ayrıntılı canlı kurulum ve deploy izlenebilirliği notları için [DEPLOY_HETZNER.md](/Users/umitkarakas/Yandex.Disk.localized/Develop/kebapci_menu/DEPLOY_HETZNER.md) dosyasına bakın.
