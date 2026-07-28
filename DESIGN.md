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

## 🔮 İleride

- [ ] API anahtarı gelince "otomatik brifing" modu (ayar → `fetch` ile Anthropic).
- [ ] Faz 3 (uzun vadeli örüntü/yansıtma analizi) — bkz. eski `hatirlatici.md`.
- [ ] Çok-cihaz senkron (backend veya Supabase) — gerekirse.
- [ ] `reminder`'ı tek tarihten diziye yükselt.
- [ ] iOS için düzgün `apple-touch-icon` (png).
