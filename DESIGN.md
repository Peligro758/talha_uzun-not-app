# 📱 Not Sistemi PWA — Tasarım & Kararlar

> CLI not+brifing sistemini (`~/Desktop/not-sistemi/`) saf istemci-tarafı bir
> PWA'ya çeviren projenin karar günlüğü. Grill oturumu: 2026-07-28.
> Önceki tasarım kararları: `~/Desktop/hatirlatici.md`.

---

## 🎯 Hedef

Mevcut CLI'daki not sistemi + günlük "koç brifingi"ni, **kolay kullanımlı bir
uygulamaya** çevirmek. Asıl amaç kişisel kullanım; mimari ileride başkalarına da
açılabilecek şekilde temiz bırakılır ama şimdilik tek kullanıcı.

## ✅ Alınan kararlar (grill özeti)

| # | Konu | Karar |
|---|------|-------|
| 1 | Kapsam | Cilalı **kişisel** uygulama; tek kullanıcı. Login/ödeme/backend **yok**; ileride çok-kullanıcıya açılabilir bırakılır. |
| 2 | Platform | **Web PWA** — Mac + telefon tarayıcısında açılır, ana ekrana kurulur. |
| 3 | Brifing tetikleme | **Açınca üret** (o gün üretilmediyse). 7/24 sunucu yok, push yok. |
| 4 | Brifingi ne üretir | **İki katman.** Uygulama AI'sız tam çalışır. Brifing = **bedava köprü**: payload → panoya kopyala → claude.ai (Pro) → cevabı geri yapıştır. API anahtarı gelince bir ayarla otomatiğe geçer. |
| 5 | Depolama | **Saf istemci PWA + IndexedDB.** Sunucu/login yok. Elle **dışa/içe aktar** yedek. Otomatik senkron yok. |
| 6 | Ön yüz | **Sade (vanilla), build adımı yok** — düz HTML/CSS/JS. |
| 7 | Yayınlama | **Bedava statik host** (Netlify/GitHub Pages), HTTPS. Mac öncelikli, telefon bonus. iOS yerel veriyi silebilir → elle yedek karşılar. |
| 8 | Brifing arşivi | Geri yapıştırılan brifing **tarihli kaydedilir** (eski `brifing/*.md` davranışı). |
| 9 | Özellikler | Ekle / listele / alt-kategori / hatırlatma **+ düzenle + sil + ara/filtre.** |
| 10 | Göç | İlk açılışta mevcut `notes.json` + bilinen alt-kategoriler **içe aktarılır**. |

## Korunan çekirdek (orijinal tasarımdan)

- Kategoriler sabit: `is | okul | hayat`.
- Alt-kategori serbest + **bilinenler listesi** + onaylı ekleme.
- Not alanları: `id`(ULID) · `category` · `subcategory` · `date`(oto) ·
  `reminder`(tek tarih, null olabilir) · `text`(çok satırlı).
- Brifing = 3 başlık: **Bugün / Radarda / Bugünün odağı**, Türkçe, aynı sistem
  prompt'u.
- Brifing verisi = son 7 gün + bugüne düşen **ve gecikmiş** hatırlatmalar.

## 🐛 Bug taraması (2026-07-28)

- SW "önce önbellek" → "önce ağ, çevrimdışıysa önbellek" (bayat sürüm takılması giderildi).
- İçe aktarmada bozuk not normalizasyonu + `collect` savunmacı (eksik `date` çökmesi giderildi).
- **Hatırlatma davranışı değişti:** eskiden `reminder == bugün`; artık `reminder <= bugün`
  (kaçırılan hatırlatmalar "Bugün"de kalır). Not listesinde "geçti/bugün" rozeti +
  hatırlatmayı temizleyen "Tamamla" düğmesi eklendi.

## 🎨 Tasarım yenileme (2026-07-28, grilling)

Yön: **kişisel + cilalı** (backend/login yok kalır). Uygulananlar:

- **Rafine koyu tema:** daha derin zemin, yumuşak kenarlıklar/gölgeler, odak halkası,
  daha iyi tipografi/boşluk. Açık tema da elden geçti.
- **Vurgu rengi indigo `#6366f1`** (zaten primary'di; tema buna göre hizalandı).
- **Hibrit gezinme:** mobilde alt çubuk (`.bottomnav`, 3 `.navbtn`) + sağ-alt FAB (`#fab`,
  "yeni not"); masaüstünde üst `.tabs`. İkisi de `data-view` taşır, `switchView()` her ikisini
  senkron tutar. Breakpoint 700px.
- **TU monogram ikon seti** (PIL ile üretildi, `make_icons.py`): `icon-192/512.png`,
  `icon-192/512-maskable.png`, `apple-touch-icon.png` (180, full-bleed → iOS gereği),
  `favicon-32.png` + `icon.svg` (TU). Manifest çoklu PNG'ye güncellendi. → iOS apple-touch
  maddesi TAMAM.
- **Boş-durum ekranları** (ikon + başlık + ipucu), view/kart/not animasyonları, toast/modal
  geçişleri, mobilde büyütülmüş dokunmatik hedefleri.
- **sw cache → v3** (yeni PNG'ler asset listesine eklendi).
- Yerel test uçtan uca geçti (DOM/JS ile; `Page.captureScreenshot` CDP donması yüzünden
  görsel screenshot alınamadı — sayfa sağlıklı, konsol temiz).

Parkedildi: cihazlar arası senkron (Cloudflare Worker — ücretsiz ama Talha maliyet
tereddüdüyle erteledi) ve gerçek hatırlatma/bildirim (iPhone PWA'da web push güvenilmez →
en sağlamı `.ics` takvim). Sıradaki turlar.

## 🔮 İleride

- [ ] **Cihazlar arası senkron** — hesapsız "sync-kodu" (Cloudflare Worker + KV, ücretsiz) veya
  ağrısız QR/Dosyalar. Grill'de parkedildi.
- [ ] **Gerçek hatırlatma** — iPhone için `.ics` "Takvime ekle" (en sağlamı); Android/masaüstü
  için Notification API.
- [ ] API anahtarı gelince "otomatik brifing" modu (ayar → `fetch` ile Anthropic).
- [ ] Faz 3 (uzun vadeli örüntü/yansıtma analizi) — bkz. eski `hatirlatici.md`.
- [ ] `reminder`'ı tek tarihten diziye yükselt.
- [x] iOS için düzgün `apple-touch-icon` (png). ✅ 2026-07-28
