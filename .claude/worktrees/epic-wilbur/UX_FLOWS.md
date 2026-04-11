# UX Flows

## Public Mobile Experience

Ana varsayim:

- QR girisi cogu zaman sube bazli olacak
- bio link girisi ise genel landing'e gelecek

## Flow 1 - Bio Link Entry

Kullanici [Instagram bio] -> [Landing] -> [Iletisim sekmesi varsayilan] -> [Sube secimi] -> [Menu sekmesi]

Expected outcome:

- kullanici once isletmeyi ve subeleri gorur
- istedigi subeyi sectikten sonra menu o subenin fiyat/stok verisiyle guncellenir

## Flow 2 - QR Entry For Specific Branch

Kullanici [QR] -> [`/b/[branchSlug]`] -> [Secili sube yuklu] -> [Iletisim] veya [Menu]

Expected outcome:

- kullanici ekstra secim yapmadan dogru subeyi gorur
- telefon, harita, WhatsApp aksiyonlari hemen gorunur
- menu fiyatlari secili subeye ait olur

## Flow 3 - Contact First

Kullanici [Landing] -> [Iletisim] -> [Sube karti] -> [Ara / Harita / WhatsApp]

Primary actions:

- telefon arama
- haritada yol tarifi
- WhatsApp ile yazisma

## Flow 4 - Menu First

Kullanici [Landing veya QR] -> [Menu] -> [Kategori] -> [Urun]

Primary actions:

- urunleri hizli tarama
- fiyat gorme
- stokta yok etiketini fark etme

## Public Screen Inventory

### Screen 1 - Landing

Sections:

- header
- sube secici
- tab navigation
- tab content area
- sticky quick actions

Low-fi layout:

```text
+----------------------------------+
| Logo        Kebabci Adi          |
| Kisa aciklama / one cikan mesaj  |
| [Sube: Kadikoy v]                |
|----------------------------------|
| [Iletisim] [Menu]                |
|----------------------------------|
| Tab content                      |
|                                  |
|                                  |
|----------------------------------|
| [Ara] [Harita] [WhatsApp]        |
+----------------------------------+
```

### Screen 2 - Contact Tab

Sections:

- secili sube karti
- adres
- calisma saatleri
- hizli iletisim butonlari
- diger subeler listesi

Low-fi layout:

```text
+----------------------------------+
| Sube: Kadikoy                    |
| Adres satiri                     |
| Bugun: 10:00 - 23:00             |
| [Ara] [WhatsApp] [Harita]        |
|----------------------------------|
| Diger subeler                    |
| [Besiktas]  [Yol tarifi]         |
| [Uskudar ]  [Yol tarifi]         |
+----------------------------------+
```

### Screen 3 - Menu Tab

Sections:

- kategori chips
- urun listesi
- urun karti
- stok etiketi

Low-fi layout:

```text
+----------------------------------+
| [Kebap] [Durum] [Icecek]         |
|----------------------------------|
| Urun adi                         |
| Kisa aciklama                    |
| 320 TL          [One cikan]      |
|----------------------------------|
| Urun adi                         |
| Kisa aciklama                    |
| Tukenmis         [Stokta yok]    |
+----------------------------------+
```

### Screen 4 - Optional Feedback

Sections:

- puan
- mesaj
- gonder

Bu ekran MVP disi tutulabilir.

## Admin Experience

## Flow 1 - Daily Price Update

Admin -> Login -> Dashboard -> Fiyatlar -> Sube filtrele -> Urun fiyatini guncelle -> Kaydet

Expected outcome:

- tekil fiyat guncelleme 10 saniye icinde tamamlanir

## Flow 2 - Batch Category Update

Admin -> Fiyatlar -> Kategori sec -> Sube sec -> Toplu guncelle -> Onizleme -> Onayla

Expected outcome:

- admin ne kadar kaydin etkilendigini onceden gorur
- hata riski azalir

## Flow 3 - Stock Toggle

Admin -> Fiyatlar -> Uygun sube ve urun -> `Stokta yok` sec -> Kaydet

Expected outcome:

- public menu aninda guncellenir

## Admin Screen Inventory

### Screen 1 - Dashboard

Cards:

- bugunku ziyaret
- en cok tiklanan sube
- en cok incelenen urun
- bekleyen geri bildirim

### Screen 2 - Branches

Use cases:

- sube ekle
- sube duzenle
- aktif/pasif yap

### Screen 3 - Products

Use cases:

- urun ekle
- kategori ata
- urun aciklamasi ve gorseli guncelle

### Screen 4 - Pricing Matrix

Bu ekran admin panelin en kritik sayfasi olmali.

Low-fi layout:

```text
+------------------------------------------------------+
| Filters: [Kategori v] [Subeler v] [Ara]             |
| [Toplu guncelle]                                     |
|------------------------------------------------------|
| Urun            Kadikoy        Besiktas   Uskudar    |
| Adana Kebap     320 TL         340 TL     330 TL     |
|                [stok var]     [stok var] [tukendi]   |
| Urfa Kebap      300 TL         320 TL     315 TL     |
|                [duzenle]      [duzenle]  [duzenle]   |
+------------------------------------------------------+
```

### Screen 5 - Batch Update Modal

Fields:

- scope
- selected branches
- selected category or products
- operation type
- preview count
- confirm

Low-fi layout:

```text
+----------------------------------------------+
| Toplu Fiyat Guncelle                         |
| Kategori: Kebap                              |
| Subeler: Kadikoy, Besiktas                   |
| Islem: %10 artis                             |
| Etkilenecek kayit: 18                        |
| [Iptal]                    [Onayla]          |
+----------------------------------------------+
```

## UX Priorities

- public tarafta once hiz, okunurluk ve tek el kullanim
- admin tarafta once hata onleme ve veri yogunlugu yonetimi
- fiyat/stok degisiklikleri icin kullaniciyi sasirtmayacak net etiketler

## Accessibility Notes

- tab butonlari buyuk hit area icermeli
- fiyat ve stok bilgisi sadece renkle anlatilmamali
- admin tablolarinda keyboard navigation dusunulmeli
