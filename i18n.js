// i18n.js — TR/EN sözlük ve çeviri yardımcıları.
// Dil tercihi localStorage'da tutulur; varsayılan Türkçe.

const LS_KEY = "not-app-lang";

const DICT = {
  tr: {
    // Gezinme
    nav_notes: "Notlar",
    nav_brief: "Brifing",
    nav_settings: "Yedek",
    // Not formu
    form_new: "Yeni not",
    form_edit: "Notu düzenle",
    lbl_category: "Kategori",
    lbl_subcategory: "Alt-kategori",
    lbl_reminder: "Hatırlatma (ops.)",
    lbl_note: "Not",
    cat_is: "İş",
    cat_okul: "Okul",
    cat_hayat: "Hayat",
    ph_subcategory: "ör. Baykar",
    ph_note: "Notun…",
    ph_search: "🔎 Ara…",
    btn_add: "Ekle",
    btn_save: "Kaydet",
    btn_cancel: "Vazgeç",
    filter_all: "Tüm kategoriler",
    // Not kartı
    tag_overdue: " · geçti",
    tag_today: " · bugün",
    btn_complete: "Tamamla",
    btn_edit: "Düzenle",
    btn_delete: "Sil",
    // Boş durumlar
    empty_notes_t: "Henüz not yok",
    empty_notes_h: "Yukarıdaki formdan ya da sağ alttaki <b>+</b> ile ekle.",
    empty_search_t: "Eşleşen not yok",
    empty_search_h: "Aramayı veya kategori filtresini değiştir.",
    empty_brief_t: "Henüz brifing yok",
    empty_brief_h: "Yukarıdan bir brifing hazırlayıp kaydet.",
    // Brifing görünümü
    brief_h2: "Sabah brifingi",
    brief_intro:
      '"Brifing hazırla" düğmesi notlarından bir metin üretip <b>panoya kopyalar</b> ve <b>claude.ai</b>\'yi açar. Oraya yapıştır (Cmd+V), Claude brifingi yazsın; sonra sonucu aşağıya geri yapıştırıp kaydet.',
    btn_prep: "Brifing hazırla · panoya kopyala",
    btn_open_claude: "claude.ai'yi aç",
    sum_show_copied: "Kopyalanan metni göster",
    brief_save_h3: "Bugünün brifingini kaydet",
    ph_brief_paste: "Claude'un yazdığı brifingi buraya yapıştır…",
    btn_save_brief: "Bugünün brifingi olarak kaydet",
    brief_arch_h3: "Brifing arşivi",
    // Brifing durum mesajları
    st_no_content:
      "Son 7 günde not yok ve bugüne düşen hatırlatma yok — önce birkaç not ekle.",
    st_copied:
      "✓ Metin <b>panoya kopyalandı</b>. Şimdi claude.ai'yi aç, Cmd+V yapıştır, Enter.",
    st_copy_fail: "Panoya kopyalanamadı — aşağıdaki metni elle kopyala.",
    st_saved: "✓ {date} brifingi kaydedildi.",
    // Yedek görünümü
    bk_h2: "Yedekleme",
    bk_intro:
      "Veriler yalnızca bu cihazın tarayıcısında tutulur. Düzenli olarak dışa aktarıp yedekle — özellikle telefonda (iOS uzun süre açılmayan uygulamanın verisini silebilir).",
    btn_export: "Dışa aktar (.json indir)",
    btn_import: "İçe aktar (.json)",
    subs_h3: "Bilinen alt-kategoriler",
    subs_empty: "(boş)",
    lang_h3: "Dil / Language",
    lang_hint: "Uygulama dilini seç. Brifing metni de seçilen dilde üretilir.",
    // Toast + modal
    t_sub_empty: "Alt-kategori boş olamaz.",
    t_note_empty: "Not boş olamaz.",
    m_new_sub: "'{sub}' bu kategoride yeni. Bilinenlere ekleyeyim mi?",
    m_ok_add: "Ekle",
    t_note_updated: "Not güncellendi.",
    t_note_added: "Not eklendi.",
    m_del_note: "Bu not silinsin mi?",
    m_ok_del: "Sil",
    t_note_deleted: "Not silindi.",
    t_rem_done: "Hatırlatma tamamlandı.",
    t_brief_empty: "Kaydedilecek brifing metni boş.",
    m_brief_overwrite: "Bugün için zaten bir brifing kayıtlı. Üzerine yazayım mı?",
    m_ok_overwrite: "Üzerine yaz",
    t_brief_saved: "Brifing kaydedildi.",
    st_import: "✓ İçe aktarıldı: {n} not, {m} brifing.",
    t_imported: "İçe aktarıldı.",
    t_import_fail: "Dosya okunamadı — geçerli bir JSON mu?",
    t_exported: "Yedek indirildi.",
    m_ok_default: "Tamam",
    // Takvim hatırlatma
    btn_addcal: "📅 Takvime ekle",
    m_add_cal: "Bu hatırlatmayı takvime ekleyeyim mi? Takvim, zamanı gelince bildirim verir.",
    m_ok_addcal: "Takvime ekle",
    t_cal_added: "Takvim dosyası hazır — açılan pencereden ekle.",
    // Senkron
    sync_h3: "Cihazlar arası senkron",
    sync_intro:
      "Mac ve telefonunda aynı notlar. Worker adresini gir, bir sync-kodu üret; diğer cihaza da aynı ikisini gir. Veri uçtan uca şifrelenir — Cloudflare içeriğini göremez.",
    sync_url: "Worker adresi",
    sync_code: "Sync-kodu",
    sync_gen: "Üret",
    sync_now: "🔄 Şimdi senkronla",
    sync_copy: "Bağlantıyı kopyala",
    sync_copied: "Bağlantı kopyalandı (adres + kod). Diğer cihazda adres kutusuna yapıştır.",
    sync_running: "Senkronlanıyor…",
    sync_ok: "✓ Senkronlandı — {n} not. Son: {time}",
    sync_err_net: "Bağlantı hatası — Worker adresi doğru mu, internet var mı?",
    sync_err_code: "Kod yanlış olabilir — diğer cihazdaki kodun birebir aynısını gir.",
    sync_err_cfg: "Worker adresi ve sync-kodu gerekli.",
    sync_last: "Son senkron: {time}",
    sync_never: "Henüz senkronlanmadı.",
    // Brifing içeriği (Claude'a giden)
    bum_date: "Bugünün tarihi: {date}",
    bum_due_head: "### Bugüne düşen ve gecikmiş hatırlatmalar",
    bum_recent_head: "### Son {days} günün notları",
    bum_none: "(yok)",
    bum_overdue: "  ⚠️ (gecikmiş — {date})",
    rem_label: "hatırlatma",
    sys_prompt: `Sen kişisel bir günlük brifing koçusun. Sana kullanıcının son notları ve bugüne düşen hatırlatmaları verilecek. Kısa, eyleme dönük, Türkçe bir sabah brifingi yaz.

Çıktı TAM OLARAK şu 3 başlıktan oluşsun (Markdown başlıkları kullan):

## Bugün
Bugüne düşen hatırlatmaları önceliklendirilmiş bir liste olarak ver. Hatırlatma yoksa "Bugüne düşen hatırlatma yok." yaz.

## Radarda
Son günlerin notlarında tekrar eden, asılı kalan ya da dikkat isteyen konuları 2-4 madde halinde özetle. Kategoriler arası bir örüntü varsa belirt.

## Bugünün odağı
Tek cümlelik, somut bir odak önerisi.

Kısa tut. Uydurma; sadece verilen notlara dayan. Abartılı motivasyon dili kullanma.`,
  },

  en: {
    // Navigation
    nav_notes: "Notes",
    nav_brief: "Briefing",
    nav_settings: "Backup",
    // Note form
    form_new: "New note",
    form_edit: "Edit note",
    lbl_category: "Category",
    lbl_subcategory: "Subcategory",
    lbl_reminder: "Reminder (opt.)",
    lbl_note: "Note",
    cat_is: "Work",
    cat_okul: "School",
    cat_hayat: "Life",
    ph_subcategory: "e.g. Baykar",
    ph_note: "Your note…",
    ph_search: "🔎 Search…",
    btn_add: "Add",
    btn_save: "Save",
    btn_cancel: "Cancel",
    filter_all: "All categories",
    // Note card
    tag_overdue: " · overdue",
    tag_today: " · today",
    btn_complete: "Complete",
    btn_edit: "Edit",
    btn_delete: "Delete",
    // Empty states
    empty_notes_t: "No notes yet",
    empty_notes_h: "Add one from the form above or the <b>+</b> button.",
    empty_search_t: "No matching notes",
    empty_search_h: "Try a different search or category filter.",
    empty_brief_t: "No briefings yet",
    empty_brief_h: "Prepare and save a briefing above.",
    // Briefing view
    brief_h2: "Morning briefing",
    brief_intro:
      'The "Prepare briefing" button builds a text from your notes, <b>copies it to the clipboard</b> and opens <b>claude.ai</b>. Paste it there (Cmd+V) and let Claude write the briefing; then paste the result below and save it.',
    btn_prep: "Prepare briefing · copy",
    btn_open_claude: "Open claude.ai",
    sum_show_copied: "Show copied text",
    brief_save_h3: "Save today's briefing",
    ph_brief_paste: "Paste the briefing Claude wrote here…",
    btn_save_brief: "Save as today's briefing",
    brief_arch_h3: "Briefing archive",
    // Briefing status messages
    st_no_content:
      "No notes in the last 7 days and nothing due today — add a few notes first.",
    st_copied:
      "✓ Text <b>copied to clipboard</b>. Now open claude.ai, paste (Cmd+V), Enter.",
    st_copy_fail: "Couldn't copy — copy the text below manually.",
    st_saved: "✓ Briefing for {date} saved.",
    // Backup view
    bk_h2: "Backup",
    bk_intro:
      "Your data lives only in this device's browser. Export and back it up regularly — especially on your phone (iOS may clear data of an app left unopened for a long time).",
    btn_export: "Export (.json)",
    btn_import: "Import (.json)",
    subs_h3: "Known subcategories",
    subs_empty: "(empty)",
    lang_h3: "Language / Dil",
    lang_hint: "Choose the app language. The briefing text is produced in the chosen language too.",
    // Toast + modal
    t_sub_empty: "Subcategory can't be empty.",
    t_note_empty: "Note can't be empty.",
    m_new_sub: "'{sub}' is new in this category. Add it to the known ones?",
    m_ok_add: "Add",
    t_note_updated: "Note updated.",
    t_note_added: "Note added.",
    m_del_note: "Delete this note?",
    m_ok_del: "Delete",
    t_note_deleted: "Note deleted.",
    t_rem_done: "Reminder completed.",
    t_brief_empty: "Nothing to save — the briefing is empty.",
    m_brief_overwrite: "A briefing for today already exists. Overwrite it?",
    m_ok_overwrite: "Overwrite",
    t_brief_saved: "Briefing saved.",
    st_import: "✓ Imported: {n} notes, {m} briefings.",
    t_imported: "Imported.",
    t_import_fail: "Couldn't read the file — is it valid JSON?",
    t_exported: "Backup downloaded.",
    m_ok_default: "OK",
    // Calendar reminder
    btn_addcal: "📅 Add to calendar",
    m_add_cal: "Add this reminder to your calendar? Your calendar will notify you when it's time.",
    m_ok_addcal: "Add to calendar",
    t_cal_added: "Calendar file ready — add it from the dialog that opens.",
    // Sync
    sync_h3: "Cross-device sync",
    sync_intro:
      "Same notes on your Mac and phone. Enter the Worker address, generate a sync code; enter the same two on the other device. Data is end-to-end encrypted — Cloudflare can't read it.",
    sync_url: "Worker address",
    sync_code: "Sync code",
    sync_gen: "Generate",
    sync_now: "🔄 Sync now",
    sync_copy: "Copy link",
    sync_copied: "Link copied (address + code). Paste it into the address box on the other device.",
    sync_running: "Syncing…",
    sync_ok: "✓ Synced — {n} notes. Last: {time}",
    sync_err_net: "Connection error — is the Worker address correct and are you online?",
    sync_err_code: "The code may be wrong — enter the exact same code as the other device.",
    sync_err_cfg: "Worker address and sync code are required.",
    sync_last: "Last sync: {time}",
    sync_never: "Not synced yet.",
    // Briefing content (sent to Claude)
    bum_date: "Today's date: {date}",
    bum_due_head: "### Reminders due today and overdue",
    bum_recent_head: "### Notes from the last {days} days",
    bum_none: "(none)",
    bum_overdue: "  ⚠️ (overdue — {date})",
    rem_label: "reminder",
    sys_prompt: `You are a personal daily briefing coach. You'll be given the user's recent notes and the reminders due today. Write a short, actionable morning briefing in English.

The output must consist of EXACTLY these 3 headings (use Markdown headings):

## Today
List today's due reminders as a prioritized list. If there are none, write "No reminders due today."

## On the radar
Summarize recurring, lingering, or attention-needing themes from recent notes in 2-4 bullets. Point out any cross-category pattern.

## Focus of the day
One concrete, single-sentence focus suggestion.

Keep it short. Don't make things up; rely only on the given notes. Avoid over-the-top motivational language.`,
  },
};

let _lang = "tr";
try {
  const saved = localStorage.getItem(LS_KEY);
  if (saved === "tr" || saved === "en") _lang = saved;
} catch (_) {}

export function getLang() {
  return _lang;
}

export function setLang(lang) {
  if (lang !== "tr" && lang !== "en") return;
  _lang = lang;
  try {
    localStorage.setItem(LS_KEY, lang);
  } catch (_) {}
  document.documentElement.lang = lang;
}

// t("key", { x: 1 }) — {x} yer tutucularını doldurur. Bilinmeyen anahtar → anahtarın kendisi.
export function t(key, params) {
  const table = DICT[_lang] || DICT.tr;
  let s = table[key];
  if (s == null) s = (DICT.tr[key] != null ? DICT.tr[key] : key);
  if (params) {
    for (const k in params) s = s.replaceAll("{" + k + "}", params[k]);
  }
  return s;
}

// Kategori etiketi (anahtar: is/okul/hayat → seçili dilde ad).
export function catLabel(key) {
  return t("cat_" + key);
}
