# API Plan

## Purpose

Bu dokuman, MVP icin gereken ana veri akislarini ve beklenen endpoint/action sinirlarini tanimlar.

Ana tercih:

- public okuma istekleri cache-friendly olmali
- admin yazma istekleri auth korumali olmali
- toplu fiyat guncelleme normal CRUD'dan ayri bir islem olarak ele alinmali

## API Style Recommendation

MVP icin iki uygun secenek var:

1. Next.js Route Handlers
2. Server Actions + ince service layer

Pragmatik tercih:

- public read tarafinda Route Handler
- admin write tarafinda Server Action veya Route Handler

Sebep:

- public veride daha net cache kontrolu
- admin form submit akislari daha basit olur

## Public Read Contracts

### `GET /api/public/business`

Purpose:

- landing header bilgileri

Response:

- business basic info
- active branches summary

### `GET /api/public/branches`

Purpose:

- public sube listesi

Response:

- active branches
- branch hours summary
- quick action links

### `GET /api/public/branches/:slug`

Purpose:

- tek sube detayi

Response:

- branch details
- hours
- quick actions

### `GET /api/public/menu`

Purpose:

- genel menu ya da varsayilan sube baglami

Query params:

- `branchSlug` optional

Response:

- selected branch summary
- categories
- products
- branch-specific price and stock info

### `POST /api/public/feedback`

Purpose:

- geri bildirim gonderimi

Rules:

- rate limit olmali
- basit spam korumasi olmali

## Admin Auth Contracts

### `POST /api/admin/auth/login`

Purpose:

- admin login

Response:

- session created
- admin profile

### `POST /api/admin/auth/logout`

Purpose:

- session kapatma

## Admin CRUD Contracts

### Branches

- `GET /api/admin/branches`
- `POST /api/admin/branches`
- `PATCH /api/admin/branches/:id`
- `PATCH /api/admin/branches/:id/status`

### Categories

- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `PATCH /api/admin/categories/:id/status`

### Products

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `PATCH /api/admin/products/:id/status`

## Pricing Contracts

### `GET /api/admin/pricing-matrix`

Purpose:

- fiyat/stok matrisi gorunumu

Query params:

- `branchIds`
- `categoryId`
- `search`
- `page`

Response:

- selected filters
- products
- per-branch price and stock cells
- total count

### `PATCH /api/admin/branch-products/:id`

Purpose:

- tekil fiyat veya stok guncelleme

Payload:

- `price` optional
- `stockStatus` optional
- `stockQuantity` optional
- `isAvailable` optional

### `POST /api/admin/pricing/batch-update`

Purpose:

- toplu fiyat guncelleme

Payload:

- `branchIds`
- `scopeType`
- `categoryId` or `productIds`
- `adjustmentType`
- `adjustmentValue`
- `previewOnly`

Recommended `scopeType`:

- `category`
- `products`

Recommended `adjustmentType`:

- `percentage`
- `fixed_delta`
- `set_fixed_price`

Response:

- affected row count
- preview sample
- batch id optional

## Analytics Contracts

### `POST /api/events`

Purpose:

- public event log kaydi

Payload:

- `eventName`
- `branchId` optional
- `productId` optional
- `source`
- `metadata`

### `GET /api/admin/analytics/summary`

Purpose:

- dashboard kartlari

Response:

- total visits
- top branches
- top products
- action click totals

## Validation Rules

### Public validation

- feedback mesaj uzunlugu limitli olmali
- public event payload whitelist ile sinirlanmali

### Admin validation

- fiyat negatif olamaz
- `stockQuantity` negatif olamaz
- `set_fixed_price` sifirdan buyuk olmali
- pasif urune toplu fiyat yazilmasi engellenmeli veya acikca tanimlanmali

## Failure Handling

Tum yazma operasyonlarinda su davranislar sabit olmali:

- validasyon hatasi alan bazli donmeli
- auth hatasi 401/403 ayrimi ile donmeli
- toplu guncellemede kismi basari varsa ozet donmeli

## Service Layer Recommendation

Kod tarafinda dogrudan route icinde sorgu toplamak yerine asagidaki servisler ayrilmali:

- `branch-service`
- `menu-service`
- `pricing-service`
- `analytics-service`
- `feedback-service`

Bu ayirim, admin panel ve public ekranin ayni domain mantigini paylasmasini kolaylastirir.
