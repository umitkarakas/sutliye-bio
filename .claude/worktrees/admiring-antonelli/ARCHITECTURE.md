# Architecture

## Recommendation

Bu proje icin en pragmatik yapi:

- tek repository
- tek web application
- mobil oncelikli public arayuz
- ayni uygulama icinde korumali `/admin` alani
- veritabani tabanli icerik yonetimi

Bu sayede ayri mobil uygulama yazmadan QR ve bio-link odakli deneyim hizli sekilde yayina alinabilir.

## Suggested Stack

### Frontend and app shell

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- mobile-first responsive UI

Neden:

- public ve admin alani tek kod tabaninda yonetilir
- SEO, Open Graph ve hizli ilk render kolaylasir
- deploy ve iterasyon maliyeti dusuk olur

### Backend

- Next.js Route Handlers veya Server Actions
- basit admin panel isleri icin ayni uygulama icinde backend katmani

Neden:

- ayri API projesi acmadan hizli baslangic
- panel CRUD islemleri ve public veri sunumu tek yerde toplanir

### Database

- PostgreSQL

Opsiyonel platformlar:

- Supabase Postgres
- Neon Postgres
- managed PostgreSQL

### ORM

- Prisma veya Drizzle

Tercih:

- hizli ekip onboarding icin Prisma
- daha ince kontrol ve SQL yakinligi icin Drizzle

### Authentication

- sadece admin auth
- mevcut implementasyonda admin girisi `.env` icindeki `ADMIN_EMAIL` ve `ADMIN_PASSWORD` ile yapilir
- mevcut oturum modeli signed cookie tabanlidir
- `admin_users` tablosu veri modelinin parcasi olsa da su an login source of truth degildir
- veritabani tabanli email/password veya magic link gecisi ayrica planlanmadan uygulanmamalidir

Musteri auth olmayacak.

### Current auth invariant

Bu repo icin bugun gecerli kural:

- login davranisi DB kayitlarina gore degistirilmez
- `DATABASE_URL` tanimli olsa bile admin login `.env` bilgileriyle calisir
- auth degisikligi yapilacaksa once bu dokuman ve ilgili backlog maddeleri birlikte guncellenir

### Media

- urun gorselleri icin object storage
- ilk fazda opsiyonel tutulabilir

## System Boundaries

### Public application

Sorumluluklari:

- landing ve tab navigasyonu
- sube listesi ve detaylari
- menu gosterimi
- geri bildirim formu
- analytics event gonderimi

### Admin application

Sorumluluklari:

- sube yonetimi
- kategori ve urun yonetimi
- sube bazli fiyat ve stok yonetimi
- toplu fiyat operasyonlari
- geri bildirim gorme/moderasyon
- dashboard ve istatistikler

### Data layer

Sorumluluklari:

- kalici veri saklama
- panelden gelen CRUD islemleri
- public goruntuleme verisi
- olay ve geri bildirim kayitlari

## Core Domain Model

### Business

- `business`
  - name
  - slug
  - logo_url
  - primary_phone
  - primary_whatsapp
  - default_currency

### Branch

- `branches`
  - id
  - business_id
  - name
  - slug
  - address
  - map_url
  - phone
  - whatsapp
  - is_active
  - display_order

- `branch_hours`
  - id
  - branch_id
  - day_of_week
  - open_time
  - close_time
  - is_closed

### Menu

- `menu_categories`
  - id
  - business_id
  - name
  - slug
  - display_order
  - is_active

- `products`
  - id
  - category_id
  - name
  - description
  - image_url
  - slug
  - badge_label nullable
  - is_featured
  - is_active
  - display_order

Urun tanimi:

- restoran urunu cekirdek olarak isim, aciklama, gorsel, kategori, aktiflik ve liste sirasi tasir
- fiyat urunun ayrilmaz parcasi olsa da veri modelinde sube baglaminda tutulur
- bu nedenle admin ve API katmanlari urunu `product + branch_product` agregasi gibi ele almalidir

### Branch-specific catalog state

Bu projede fiyat ve stok sube bazli olacak. Bu nedenle urun tablosunda fiyat tutmak yerine sube-urun iliskisi ana kayit olmali:

- `branch_product_prices`
  - id
  - branch_id
  - product_id
  - price
  - currency nullable
  - is_available
  - stock_quantity nullable
  - stock_status
  - is_featured_override nullable
  - updated_at

Onerilen `stock_status` degerleri:

- `in_stock`
- `out_of_stock`
- `hidden`

Bu model ile:

- ayni urun farkli subelerde farkli fiyatla satilabilir
- bir subede stokta olmayan urun diger subede aktif kalabilir
- public menu sube baglamina gore dogru fiyat ve stokla render edilir
- admin urun listesi cekirdek urun kaydini ve sube fiyat ozetini ayni yerde gosterebilir

### Bulk pricing support

Toplu fiyat guncelleme icin uygulama tarafinda su operasyonlar desteklenmeli:

- tek urun + tek sube guncelleme
- tek urun + coklu sube guncelleme
- kategori + secili subeler icin toplu artis/azalis
- kategori + secili subeler icin sabit fiyat atama

Audit ihtiyaci buyurse sonraki fazda su tablo eklenebilir:

- `price_update_batches`
  - id
  - admin_user_id
  - scope_type
  - adjustment_type
  - adjustment_value
  - created_at

### Feedback

- `feedback`
  - id
  - branch_id nullable
  - rating nullable
  - message
  - source
  - status
  - created_at

### Analytics

- `event_logs`
  - id
  - event_name
  - branch_id nullable
  - product_id nullable
  - source
  - session_id
  - created_at

## Routing Model

### Public routes

- `/`
  - genel landing
- `/b/[branchSlug]`
  - sube odakli landing
- `/menu`
  - genel menu
- `/feedback`
  - geri bildirim

Not:

QR kodlar dogrudan sube bazli URL'lere gitmeli. Sosyal medya bio linki ise genel landing'e gidebilir.

### Admin routes

- `/admin/login`
- `/admin`
- `/admin/branches`
- `/admin/categories`
- `/admin/products`
- `/admin/feedback`
- `/admin/analytics`

Admin login notu:

- `/admin/login` formu dogrudan `.env` tabanli auth route'una gider
- DB tabanli auth'a gecilmeden `admin_users.password_hash` zorunlu varsayilmaz

## UI Architecture

### Public UI

- tek elde kullanima uygun alt sabit sekme veya ust segmented tab
- buyuk aksiyon butonlari
- sube kartlari
- kategori anchor navigasyonu
- hizli arama opsiyonel

### Admin UI

- tablo + form karmasi basit CRUD
- hizli fiyat guncelleme
- toplu fiyat aksiyonu modal veya yan paneli
- sube-urun matrisi gorunumu
- sube filtreleme
- mobil degil, once tablet ve desktop odakli

## Content Strategy

Icerik deploy ile degil, panel verisiyle yonetilmeli.

Bu nedenle:

- urunler kod icine hardcode edilmemeli
- subeler statik dosyada tutulmamali
- fiyat guncellemesi admin panelinden yapilmali

## Analytics Strategy

Ilk asamada anonim event tracking yeterli:

- session cookie veya anonim session id
- PII toplamadan olay kaydi
- admin panelinde toplam goruntulenme ve aksiyon dagilimi

Dashboard metrikleri:

- toplam ziyaret
- sube bazli ziyaret
- telefon tiklama
- harita tiklama
- en cok incelenen urunler
- geri bildirim sayisi

## Security Baseline

- admin rotalari auth zorunlu olmali
- tum admin yazma islemleri server tarafinda authorize edilmeli
- public feedback icin rate limit olmali
- admin form girisleri server-side validate edilmeli

## Delivery Strategy

Tek seferde her seyi kurmak yerine asamali ilerleme onerilir:

1. veri modeli + public shell
2. public content rendering
3. admin CRUD
4. analytics
5. feedback ve moderasyon

## Key Risks

### 1. Bulk update mistakes

Toplu fiyat operasyonlari geri alinamaz veya onizlemesiz olursa panel hataya acik hale gelir.

### 2. Admin complexity creep

Istatistik, yorum, medya ve rol yonetimi ayni anda eklenirse MVP gecikir.

### 3. Slow QR landing

Fazla agir tasarim veya buyuk gorseller QR trafiginde terk oranini artirir.

### 4. Branch-product data volume

Sube sayisi ve urun sayisi arttikca `branch x product` kayit sayisi hizla buyur. Listeleme ve toplu guncelleme sorgulari buna gore tasarlanmalidir.

## Recommended First Build Order

1. Bilgi mimarisi ve veri modeli kesinlestirilsin.
2. Public mobil wireframe cikarilsin.
3. Teknoloji secimi kilitlensin.
4. Branch-product fiyat/stok matrisi netlestirilsin.
5. Repo bootstrap edilsin.
6. Public MVP gelistirilsin.
7. Admin CRUD ve toplu fiyat aksiyonlari eklensin.
8. Analytics ve feedback ikinci dalgada gelsin.
