# Musteri ve Siparis Yonetim Sistemi v2

Bu proje, bir isletmenin musterilerini yonetebilmesi, siparis sureclerini takip edebilmesi ve musteri bazli detayli raporlar alabilmesi amaciyla gelistirilmis full-stack bir web uygulamasidir. Onceki versiyonun uzerine insa edilen bu surum, veri iliskileri ve sayfa mimarisi acisindan daha gelismis bir yapi sunar.

## Temel Ozellikler

- Musteri Yonetimi: Musteri kaydi olusturma, listeleme ve detayli musteri profili goruntuleme.
- Siparis Takibi: Yeni siparis girisi yapma ve siparislerin musteri hesaplariyla iliskilendirilmesi.
- Dinamik Dashboard: Isletmenin genel durumunu ozetleyen ana sayfa yapisi.
- Detayli Gorunum: Her musteriye ozel satis ve is geçmişinin takip edilebildigi alt sayfalar.

## Teknik Stack

### Frontend (Istemci)
- React: Bilesen tabanli arayuz gelistirme.
- Vite: Modern build araci ve hizli gelistirme ortami.
- Tailwind CSS: Utility-first yaklasimi ile modern tasarim katmani.
- React Router: Uygulama ici navigasyon ve sayfa yonetimi.

### Backend (Sunucu)
- Go (Golang): Yuksek performansli API mimarisi.
- Fiber v2: Hizli ve minimalist web framework.
- Go Modules: Bagimlilik yonetimi.

## Proje Yapisi

- perde-backend/: Go tabanli API servislerinin ve isletme mantiginin bulundugu dizin.
- src/pages/: Is sureclerine gore ayrilmis React sayfalarini iceren dizin.
- src/components/: Tekrar kullanilabilir arayuz bilesenleri.

## Kurulum ve Kullanim

### Frontend Hazirligi
1. Proje ana dizinine gidin.
2. Gerekli paketleri yukleyin:
   npm install
3. Uygulamayi baslatin:
   npm run dev

### Backend Hazirligi
1. perde-backend klasorune gecis yapin.
2. Go bagimliliklarini yukleyin:
   go mod tidy
3. Sunucuyu calistirin:
   go run main.go

## Not
Bu calisma, yazilim gelistirme surecimdeki moduler mimari ve veri iliskileri konusundaki yetkinliklerimi belgelemek amaciyla v2 olarak adlandirilmistir.
