# Kebabci Menu Project

## Product Goal

Kebapci icin mobil odakli bir web deneyimi kurulacak. Kullanici bu deneyime:

- sosyal medya bio linklerinden
- masaustu veya fiziksel alandaki QR kodlardan
- dogrudan paylasilan URL'lerden

ulasabilecek.

Ana hedef, kullanicinin tek ekranda hizli sekilde:

- sube ve iletisim bilgilerine ulasmasi
- menu ve fiyatlari gormesi
- gerekiyorsa geri bildirim birakmasi

ve isletmenin bu icerigi panelden yonetebilmesi.

## Product Scope

### Public mobile experience

Ilk surumde public tarafta 2 ana sekme zorunlu, 1 ek alan opsiyonel:

1. Iletisim
   - genel isletme bilgileri
   - sube listesi
   - sube detaylari
   - telefon, WhatsApp, harita, calisma saatleri
2. Menu
   - kategori bazli urun listesi
   - urun aciklamasi
   - fiyat bilgisi
   - stokta yok veya one cikan urun gibi durum etiketleri
3. Geri bildirim (faz 2)
   - yorum
   - puanlama
   - basit memnuniyet geri bildirimi

### Admin experience

- sube yonetimi
- menu kategori ve urun yonetimi
- sube bazli fiyat ve stok yonetimi
- toplu fiyat guncelleme
- iletisim bilgisi guncelleme
- anonim kullanici istatistikleri
- geri bildirim moderasyonu

## Constraints

- Musteri hesabi olmayacak.
- Musteri girisi ve kayit akisi ilk etapta olmayacak.
- Admin login mevcut fazda `.env` tabanli kalacak; DB tabanli auth bu fazin parcasi degil.
- Sistem mobil oncelikli olacak, ama masaustunde de duzgun calisacak.
- QR ve bio link trafigi icin hizli acilis ve sade gezinme kritik.

## Users

### 1. Son kullanici

Amaci hizli sekilde menu, fiyat, sube, telefon ve konum bilgisine ulasmak.

### 2. Isletme yoneticisi

Amaci panelden urunleri, fiyatlari, subeleri ve iletisim bilgilerini guncellemek; hangi linklerin daha cok kullanildigini gormek.

## MVP Definition

MVP'de asagidaki yetenekler mutlaka olmali:

- mobil uyumlu public landing
- iki sekmeli yapi: `Iletisim` ve `Menu`
- birden fazla sube tanimi
- her sube icin ayri telefon, adres, harita linki, calisma saati
- kategori bazli urun listeleme
- her sube icin urun fiyati ve stok durumu tanimlama
- panelden toplu ve tekil fiyat guncelleme
- `.env` tabanli admin girisi
- temel olay bazli istatistikler

MVP disinda tutulacaklar:

- musteri login sistemi
- online siparis
- odeme entegrasyonu
- kampanya motoru
- kupon veya sadakat programi

## Recommended Information Architecture

### Public

- Home / Landing
- Tab 1: Iletisim
- Tab 2: Menu
- Optional Tab 3: Geri Bildirim

### Admin

- Dashboard
- Subeler
- Kategoriler
- Urunler
- Fiyatlar
- Geri Bildirimler
- Ayarlar

## Functional Requirements

### Public side

- Kullanici tum subeleri gorebilmeli.
- Kullanici bir subeye tiklayinca sube detayini gorebilmeli.
- Kullanici telefon numarasina dokunup arama baslatabilmeli.
- Kullanici WhatsApp veya benzeri hizli iletisim aksiyonlarina gidebilmeli.
- Kullanici harita linkiyle navigasyon baslatabilmeli.
- Kullanici urunleri kategorilere gore gorebilmeli.
- Fiyatlar kolay okunur ve guncel olmali.
- Stokta olmayan urunler sube bazinda dogru sekilde gosterilmeli.

### Admin side

- Admin sube ekleyebilmeli, guncelleyebilmeli, pasife alabilmeli.
- Admin kategori ekleyebilmeli ve sira duzeni verebilmeli.
- Admin urun ekleyebilmeli, aciklama/fotograf bilgisini guncelleyebilmeli.
- Admin her sube icin urun bazli fiyat ve stok bilgisi girebilmeli.
- Admin secili urunleri veya tum kategoriyi toplu fiyat guncelleme ile duzenleyebilmeli.
- Admin urunu yayindan kaldirabilmeli.
- Admin hangi subenin daha cok ziyaret aldigini gorebilmeli.
- Admin hangi aksiyonlarin daha cok kullanildigini gorebilmeli.

## Non-Functional Requirements

- Ilk yuklenme mobilde hizli olmali.
- QR acilisinda tek elle kullanima uygun UI olmali.
- Panel basit ve hata toleransli olmali.
- Icerik guncellemeleri deploy gerektirmeden yayinlanmali.
- Temel SEO ve sosyal paylasim meta bilgileri olmali.

## Analytics Events

Asagidaki olaylar ilk gunden izlenebilir olmali:

- page_view
- tab_view
- branch_view
- call_click
- whatsapp_click
- map_click
- menu_item_view
- feedback_submit

## Delivery Phases

### Phase 1 - Foundation

- urun kapsamini netlestir
- veri modelini tasarla
- public ve admin alanlarini ayir
- temel UI sistemi kur

### Phase 2 - Public MVP

- landing ve tab yapisi
- sube kartlari ve detaylari
- menu kategorileri ve urun listesi
- QR ve bio link giris senaryolari

### Phase 3 - Admin MVP

- `.env` tabanli admin auth
- sube CRUD
- kategori CRUD
- urun CRUD
- sube bazli fiyat/stok yonetimi
- toplu ve tekil fiyat guncelleme

### Phase 4 - Feedback and Analytics

- geri bildirim toplama
- yorum moderasyonu
- olay toplama
- dashboard raporlama

### Phase 5 - Hardening

- performans optimizasyonu
- rol bazli genisleme
- coklu dil
- kampanya ve duyuru alani

## Open Product Decisions

Asagidaki kararlar erken verilirse implementasyon daha saglikli olur:

- feedback herkese acik mi, yoksa sadece belirli QR linklerinden mi acilacak
- urun gorselleri zorunlu mu, opsiyonel mi
- admin panelini tek isletmeci mi kullanacak, birden fazla editor olacak mi
- admin auth ileride DB tabanli kullanici sistemine gececek mi, yoksa `.env` tabanli tek yonetici mi kalacak
- public tarafta tek bir genel sayfa mi olacak, yoksa sube bazli farkli acilis sayfalari da olacak mi
- toplu fiyat guncelleme yuzdesel artis/azalis ve sabit tutar olarak mi desteklenecek
- stok durumu sadece `var/yok` mu olacak, yoksa sayisal envanter de tutulacak mi

## Initial Success Metrics

- QR veya bio linkten gelen kullanicinin 3 saniye altinda ana ekrani gorebilmesi
- kullanicilarin en az bir aksiyona tiklama orani
- panelden fiyat guncelleme isleminin tek oturumda tamamlanabilmesi
- sube detayina gecis ve arama/harita aksiyonlarinin izlenebilmesi
- toplu fiyat guncelleme sonrasi ilgili sube menu fiyatlarinin aninda yansimasi
