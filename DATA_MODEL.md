# Data Model

## Planning Defaults

Bu dokuman, implementasyona baslamak icin su varsayimlari kabul eder:

- fiyat ve stok sube bazli tutulur
- toplu fiyat guncelleme 3 mod destekler:
  - yuzdesel artis/azalis
  - sabit tutar ekle/cikar
  - dogrudan yeni fiyat ata
- stok modeli hibrit ilerler:
  - her kayitta `stock_status` zorunlu
  - `stock_quantity` opsiyonel

Bu yapi MVP'yi gereksiz karmasiklastirmadan gelecekteki ihtiyaclari da acik birakir.

## Entity Overview

### Core entities

- `business`
- `admin_users`
- `branches`
- `branch_hours`
- `menu_categories`
- `products`
- `branch_products`
- `feedback`
- `event_logs`

## Table Details

### `business`

Tek isletme ile baslansa da yapinin isletme kaydina dayanmasi genisleme riskini azaltir.

Fields:

- `id`
- `name`
- `slug`
- `logo_url`
- `primary_phone`
- `primary_whatsapp`
- `default_currency`
- `created_at`
- `updated_at`

### `admin_users`

Fields:

- `id`
- `business_id`
- `email`
- `password_hash` or `auth_provider_id`
- `full_name`
- `role`
- `is_active`
- `last_login_at`
- `created_at`
- `updated_at`

Recommended roles:

- `owner`
- `editor`

MVP'de tek admin olsa bile role alani sonra migration gereksinimini azaltir.

### `branches`

Fields:

- `id`
- `business_id`
- `name`
- `slug`
- `address`
- `district`
- `city`
- `map_url`
- `phone`
- `whatsapp`
- `latitude` nullable
- `longitude` nullable
- `is_active`
- `display_order`
- `created_at`
- `updated_at`

Rules:

- `slug` business icinde unique olmali
- pasif sube public listede gosterilmemeli

### `branch_hours`

Fields:

- `id`
- `branch_id`
- `day_of_week`
- `open_time`
- `close_time`
- `is_closed`

Rules:

- `branch_id + day_of_week` unique olmali

### `menu_categories`

Fields:

- `id`
- `business_id`
- `name`
- `slug`
- `description` nullable
- `display_order`
- `is_active`
- `created_at`
- `updated_at`

Rules:

- `display_order` public ekranda kategori sirasini belirler

### `products`

Bu tablo urunun ortak kimligini tutar. Fiyat ve stok burada tutulmaz.

Fields:

- `id`
- `business_id`
- `category_id`
- `name`
- `slug`
- `description`
- `image_url` nullable
- `badge_label` nullable
- `is_featured`
- `is_active`
- `display_order`
- `created_at`
- `updated_at`

Rules:

- `business_id + slug` unique olmali
- `is_active = false` ise urun hicbir subede public gosterilmemeli

### `branch_products`

Bu tablo MVP'nin kritik tablosu.

Fields:

- `id`
- `branch_id`
- `product_id`
- `price`
- `currency`
- `stock_status`
- `stock_quantity` nullable
- `is_available`
- `display_order_override` nullable
- `is_featured_override` nullable
- `created_at`
- `updated_at`

Recommended `stock_status` enum:

- `in_stock`
- `out_of_stock`
- `hidden`

Rules:

- `branch_id + product_id` unique olmali
- `hidden` urunu ilgili subede tamamen gizler
- `out_of_stock` urunu gosterir ama siparis/aksiyon yoksa sadece bilgi etiketiyle sunar
- `stock_quantity` kullaniliyorsa `0` degeri `out_of_stock` ile uyumlu olmali

### `feedback`

Fields:

- `id`
- `business_id`
- `branch_id` nullable
- `rating` nullable
- `message`
- `source`
- `status`
- `contact_name` nullable
- `contact_phone` nullable
- `created_at`

Recommended `status` enum:

- `new`
- `reviewed`
- `archived`

### `event_logs`

Fields:

- `id`
- `business_id`
- `branch_id` nullable
- `product_id` nullable
- `session_id`
- `event_name`
- `source`
- `metadata_json` nullable
- `created_at`

Recommended `event_name` values:

- `page_view`
- `tab_view`
- `branch_view`
- `call_click`
- `whatsapp_click`
- `map_click`
- `menu_item_view`
- `feedback_submit`

## Bulk Pricing Operations

### Operation 1: Single price update

Input:

- branch
- product
- new price
- optional stock update

Effect:

- ilgili `branch_products` kaydi guncellenir

### Operation 2: Multi-branch single product update

Input:

- selected product
- selected branches
- price mode
- value

Effect:

- secilen subelerde ayni urun guncellenir

### Operation 3: Category batch update

Input:

- selected category
- selected branches
- adjustment type
- adjustment value

Adjustment types:

- `percentage`
- `fixed_delta`
- `set_fixed_price`

Effect:

- secili kategoriye bagli `branch_products` satirlari toplu guncellenir

## Recommended Admin Safeguards

- toplu islem oncesi etkilenecek kayit sayisi gosterilmeli
- islem onay modal'i olmali
- islem sonucu ozet ekran gosterilmeli
- ileride rollback icin batch log tutulmali

## Query Patterns

### Public menu by branch

Gerekli join:

- `branches`
- `menu_categories`
- `products`
- `branch_products`

Filtreler:

- branch aktif olmali
- kategori aktif olmali
- urun aktif olmali
- `branch_products.stock_status != hidden`

### Admin pricing matrix

Gerekli gorunum:

- satirlar urunler
- sutunlar secili subeler
- hucreler fiyat + stok durumu

Bu ekran icin server-side pagination gerekebilir.

## Index Recommendations

- `branches (business_id, is_active, display_order)`
- `menu_categories (business_id, is_active, display_order)`
- `products (business_id, category_id, is_active, display_order)`
- `branch_products (branch_id, product_id)` unique
- `branch_products (branch_id, stock_status)`
- `event_logs (business_id, event_name, created_at)`
- `feedback (business_id, status, created_at)`

## Seed Data Strategy

Ilk demoda asagidaki seed veriler olmali:

- 1 business
- 3 branches
- 5 to 8 categories
- 20 to 40 products
- her sube icin tum urunlerde `branch_products` kaydi

Bu, public ekran ve admin fiyat/stok panelini gercekci sekilde test etmeyi kolaylastirir.
