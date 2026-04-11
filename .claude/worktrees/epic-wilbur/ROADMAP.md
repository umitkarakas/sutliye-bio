# Roadmap

## Milestone 1 - Planning and Foundation

### Goal

MVP icin urun kararlari ve teknik temel netlessin.

### Deliverables

- teknoloji secimi kesinlesmis olsun
- veri modeli onaylansin
- public/admin bilgi mimarisi netlessin
- branch bazli fiyat ve stok modeli netlessin
- tasarim yonu ve wireframe seviyesi iskelet cikarilsin

### Exit Criteria

- `PROJECT.md` ve `ARCHITECTURE.md` uzerindeki acik kararlar netlesmis olsun
- branch bazli fiyat ve stok stratejisi karara baglanmis olsun
- ilk ekranlarin dusuk sadakatli taslagi hazir olsun

## Milestone 2 - Public MVP

### Goal

Kullanici QR veya bio linkten gelip menu ve iletisim bilgisine ulasabilsin.

### Deliverables

- mobil landing
- `Iletisim` sekmesi
- `Menu` sekmesi
- sube listesi ve sube detaylari
- kategori bazli menu listeleme
- temel SEO ve sosyal paylasim meta yapisi

### Exit Criteria

- kullanici ana akislari calisiyor olsun
- panel olmadan da seed veri ile demo alinabilsin

## Milestone 3 - Admin MVP

### Goal

Isletme panelden icerigi yonetebilsin.

### Deliverables

- `.env` tabanli admin login
- sube CRUD
- kategori CRUD
- urun CRUD
- sube bazli fiyat/stok yonetimi
- tekil fiyat girisi
- toplu fiyat guncelleme
- stok durumu guncelleme
- yayinda/pasif urun yonetimi

### Exit Criteria

- demo verisi yerine panel verisi public ekrana yansisin
- fiyat, stok veya sube bilgisi degisince deploy gerekmeksizin yayinlansin
- auth source of truth `.env` olarak korunuyor olsun; DB tabanli auth'a gecis ayrica planlanmis olsun

## Milestone 4 - Analytics and Feedback

### Goal

Kullanim gorunurlugu ve temel etkilesim toplama aktif olsun.

### Deliverables

- anonim event tracking
- admin dashboard ozet metrikleri
- opsiyonel geri bildirim formu
- yorum veya mesajlar icin moderasyon durumu

### Exit Criteria

- tiklama ve ziyaret olaylari raporlanabiliyor olsun
- geri bildirim akisi kotuye kullanima karsi korunmus olsun

## Milestone 5 - Hardening

### Goal

Urun yayina daha hazir hale gelsin.

### Deliverables

- performans iyilestirmeleri
- hata durumlari
- erisilebilirlik duzeltmeleri
- temel guvenlik sertlestirmeleri
- deployment ve operasyon notlari

## Suggested Build Order

1. Wireframe ve ekran akislari
2. Repo bootstrap
3. Database schema
4. Public UI
5. Admin CRUD
6. Analytics
7. Feedback

## Immediate Next Decisions

Asagidaki 5 karar, implementasyona baslamadan once netlesmeli:

1. Tech stack: Next.js + Postgres secimini kilitliyor muyuz
2. Toplu fiyat guncelleme tipleri: yuzdesel, sabit tutar ve sabit fiyat atama desteklenecek mi
3. Stok modeli: sadece var/yok mu, yoksa sayisal adet de tutulacak mi
4. Geri bildirim: MVP mi, faz 2 mi
5. Deploy hedefi: Vercel, Cloudflare veya baska bir platform mu
