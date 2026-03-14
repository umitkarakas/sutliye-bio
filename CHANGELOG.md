# Changelog

## [Unreleased] — 2026-03-15

### Eklenenler
- **Silme onay dialogu** (`components/confirm-delete-button.tsx`): Ürün silme işlemi artık `window.confirm` ile onay istiyor; yanlışlıkla silme önleniyor.
- **Admin loading skeleton** (`app/admin/loading.tsx`): Tüm admin alt rotalarını kapsayan animasyonlu yükleme ekranı.
- **Admin error boundary** (`app/admin/error.tsx`): Beklenmeyen hata durumunda "Tekrar dene" butonlu hata sayfası.

---

## 2026-03-14

### Eklenenler
- **Ürün + fiyat tek formda** (`app/admin/products/page.tsx`, `components/product-pricing-section.tsx`): Ürün ekleme ve düzenleme formları artık şube bazlı fiyat ve stok durumunu içeriyor. Ayrı fiyatlandırma sayfasına gitmeye gerek yok.
- **Şube bazlı fiyatlandırma bileşeni** (`components/product-pricing-section.tsx`): "Tüm şubelere aynı fiyat" ve "Şube bazlı fiyat" modları arasında geçiş yapılabilen React istemci bileşeni.
- **Toplu Fiyat sayfası sadeleştirildi** (`app/admin/pricing/page.tsx`): Tekil ürün fiyatı kaldırıldı, yalnızca toplu işlem formu kaldı.
- **Admin editör UX**: Ürün listesinde yalnızca "Düzenle" butonu görünüyor. Sırala/Durum/Sil aksiyonları editörün altında, kaydet/vazgeç'in hemen altında toplandı.
- **Çalışma saatleri yönetimi**: Şubeler sayfasında günlük açık/kapalı saat girişi eklendi.
- **Marka SEO alanları** (`app/admin/branding/page.tsx`): `seoTitle` ve `seoDescription` alanları marka formuna eklendi.

### Değişiklikler
- Admin nav'da "Fiyatlandırma" etiketi "Toplu Fiyat" olarak güncellendi.
- `parseBranchPricing` server action helper'ı: uniform modda tüm aktif şubelere fiyat uyguluyor.

---

## 2026-03-10

### Değişiklikler
- PublicShell grid düzeni güncellendi.
- `next-env.d.ts` import yolu düzeltildi.
- UI genel düzenlemeleri.
