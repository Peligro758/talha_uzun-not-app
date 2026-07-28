// brifing.js — "bedava köprü" brifing mantığı.
// Notlardan payload üretir; panoya kopyalar; claude.ai'yi açar; sonucu kaydeder.
// (brifing.py + brifing_manuel.py'nin tarayıcı karşılığı.)

import { allNotes, CATEGORY_LABELS } from "./db.js";

export const WINDOW_DAYS = 7;

export const SYSTEM_PROMPT = `Sen kişisel bir günlük brifing koçusun. Sana kullanıcının son notları ve bugüne düşen hatırlatmaları verilecek. Kısa, eyleme dönük, Türkçe bir sabah brifingi yaz.

Çıktı TAM OLARAK şu 3 başlıktan oluşsun (Markdown başlıkları kullan):

## Bugün
Bugüne düşen hatırlatmaları önceliklendirilmiş bir liste olarak ver. Hatırlatma yoksa "Bugüne düşen hatırlatma yok." yaz.

## Radarda
Son günlerin notlarında tekrar eden, asılı kalan ya da dikkat isteyen konuları 2-4 madde halinde özetle. Kategoriler arası bir örüntü varsa belirt.

## Bugünün odağı
Tek cümlelik, somut bir odak önerisi.

Kısa tut. Uydurma; sadece verilen notlara dayan. Abartılı motivasyon dili kullanma.`;

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtNote(n) {
  const cat = CATEGORY_LABELS[n.category] || n.category;
  let head = `- (${n.date}) [${cat}/${n.subcategory}]`;
  if (n.reminder) head += ` [hatırlatma: ${n.reminder}]`;
  const body = (n.text || "").replace(/\n/g, "\n  ");
  return `${head}\n  ${body}`;
}

// Son 7 gün + bugüne düşen hatırlatmaları topla.
export async function collect() {
  const today = todayStr();
  const cutoff = parseDate(today);
  cutoff.setDate(cutoff.getDate() - WINDOW_DAYS);
  const notes = await allNotes();

  const valid = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const recent = notes
    .filter((n) => valid(n.date) && parseDate(n.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Bugüne düşen + gecikmiş (kaçırılmış) hatırlatmalar; eski tarih önce.
  const due = notes
    .filter((n) => n.reminder && n.reminder <= today)
    .sort((a, b) => a.reminder.localeCompare(b.reminder));
  return { today, recent, due };
}

export function buildUserMessage({ today, recent, due }) {
  const parts = [`Bugünün tarihi: ${today}`, ""];
  parts.push("### Bugüne düşen ve gecikmiş hatırlatmalar");
  const dueLine = (n) => {
    const s = fmtNote(n);
    return n.reminder < today ? s + `  ⚠️ (gecikmiş — ${n.reminder})` : s;
  };
  parts.push(due.length ? due.map(dueLine).join("\n") : "(yok)");
  parts.push("");
  parts.push(`### Son ${WINDOW_DAYS} günün notları`);
  parts.push(recent.length ? recent.map(fmtNote).join("\n") : "(yok)");
  return parts.join("\n");
}

// claude.ai'ye yapıştırılacak tam metin.
export async function buildPayload() {
  const data = await collect();
  const hasContent = data.recent.length > 0 || data.due.length > 0;
  const payload = SYSTEM_PROMPT + "\n\n---\n\n" + buildUserMessage(data);
  return { payload, hasContent, ...data };
}
