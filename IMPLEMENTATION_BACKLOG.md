# Implementation Backlog

## Phase 1 - Foundation

### 1. Product decisions

- tech stack'i kilitle
- deploy platformunu sec
- feedback alaninin MVP veya faz 2 kararini ver
- stok modelinde `stock_quantity` kullanimi kararini ver

### 2. Repo bootstrap

- Next.js app olustur
- TypeScript ve lint ayarlarini kur
- Tailwind CSS kur
- temel app shell klasor yapisini olustur

### 3. Data foundation

- ORM sec
- veritabani baglantisini kur
- ilk schema migration dosyalarini olustur
- seed stratejisini tanimla

### 4. Design foundation

- public mobile layout iskeleti
- admin layout iskeleti
- tipografi ve renk sistemi
- temel buton, kart, chip, table pattern'leri

## Phase 2 - Public MVP

### 5. Public shell

- landing route
- branch context state
- tab navigation
- sticky quick actions

### 6. Contact experience

- branch selector
- branch cards
- branch detail summary
- call / map / WhatsApp links

### 7. Menu experience

- category chips
- product list
- branch-specific price render
- stock badge render

### 8. SEO and sharing

- title templates
- open graph tags
- QR girisleri icin branch sayfa metasi

## Phase 3 - Admin MVP

### 9. Admin auth

- login page
- protected routes
- session handling
- not: mevcut fazda source of truth `.env` alanlari (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- not: `admin_users` tablosunu login'e baglamak ayrica planlanmis bir is olmadan yapilmayacak

### 10. CRUD screens

- branch CRUD
- category CRUD
- product CRUD

### 11. Pricing matrix

- sube filtreleme
- kategori filtreleme
- inline tekil fiyat edit
- stok toggle

### 12. Batch pricing

- batch update modal
- onizleme hesaplama
- update execution
- success summary

## Phase 4 - Analytics and Feedback

### 13. Event tracking

- public event helper
- server event endpoint or action
- dashboard summary query

### 14. Feedback

- public feedback form
- moderation list
- status update action

## Phase 5 - Hardening

### 15. Quality

- empty states
- error states
- loading states
- accessibility pass

### 16. Reliability

- admin validation
- rate limit
- audit logging for bulk actions
- query optimization

## Suggested First Sprint

Bu sprint yalnizca temeli atmali.

Sprint scope:

- Next.js repo bootstrap
- database schema
- seed data
- public landing wireframe
- branch selector
- static demo menu render

Sprint out of scope:

- admin panel
- analytics dashboard
- feedback
- media upload

## Suggested Second Sprint

- admin auth
- branch CRUD
- product/category CRUD
- pricing matrix v1
- single price update

## Suggested Third Sprint

- batch pricing operations
- analytics events
- dashboard cards
- feedback module if needed

## Delivery Notes

- public taraf MVP'ye once ulasmali
- admin panel public veri modeline baglanmadan baslatilmamali
- toplu fiyat ozelligi tekil fiyat akisi saglamlasmadan gelmemeli
