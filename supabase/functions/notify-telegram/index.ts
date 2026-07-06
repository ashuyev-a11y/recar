// Supabase Edge Function: notify-telegram
// ------------------------------------------------------------------
// Шлёт каждую новую заявку с сайта RE:CAR в Telegram-группу.
// Вызывается двумя Database Webhooks (на INSERT в leads и bookings).
//
// Секреты задаются в дашборде Supabase (НЕ в коде, не в git):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id группы (например -5373399519)
//   WEBHOOK_SECRET     — случайная строка; её же кладём в заголовок вебхука
//
// SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY Supabase отдаёт функции сам
// (встроенные переменные) — нужны, чтобы сделать временные подписанные
// ссылки на фото из приватного бакета и отправить их в Telegram.
//
// ПДн не логируем: в консоль пишем только имя таблицы и статус Telegram.
// ------------------------------------------------------------------

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const PHOTOS_BUCKET = "lead-photos";
const SIGNED_TTL = 3600; // сек — на скачивание Telegram и короткий просмотр по ссылке

// Экранируем для HTML-режима Telegram, чтобы <, >, & не ломали сообщение.
function esc(v: unknown): string {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Время заявки по Уральску (UTC+5).
function fmtTime(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Oral",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

// deno-lint-ignore no-explicit-any
function buildMessage(table: string, r: Record<string, any>): string {
  const lines: string[] = [];

  if (table === "bookings") {
    lines.push("📅 <b>Запись на слот</b>");
    if (r.name) lines.push(`👤 ${esc(r.name)}`);
    if (r.phone) lines.push(`📞 ${esc(r.phone)}`); // Telegram сам делает телефон кликабельным
    if (r.service_type) lines.push(`🛠 Услуга: ${esc(r.service_type)}`);
    if (r.preferred_at) lines.push(`📅 Желаемое время: ${esc(r.preferred_at)}`);
    if (r.comment) lines.push(`💬 ${esc(r.comment)}`);
  } else {
    // leads (заявка / оценка по фото / калькулятор)
    lines.push("🔧 <b>Оценка/заявка</b>");
    if (r.name) lines.push(`👤 ${esc(r.name)}`);
    if (r.phone) lines.push(`📞 ${esc(r.phone)}`);
    const car = [r.car_make, r.car_model].filter(Boolean).join(" ");
    if (car) lines.push(`🚗 Авто: ${esc(car)}`);
    if (r.service_type) lines.push(`🛠 Услуга: ${esc(r.service_type)}`);
    // Для калькулятора здесь лежит состав расчёта и предварительная сумма.
    if (r.description) lines.push(`\n📝 ${esc(r.description)}`);
  }

  const time = fmtTime(r.created_at ?? null);
  if (time) lines.push(`\n🕒 ${time}`);
  return lines.join("\n");
}

// Вызов Telegram Bot API.
// deno-lint-ignore no-explicit-any
async function tg(method: string, body: Record<string, any>) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, ok: res.ok };
}

// Пути из leads.photo_urls (JSON-массив строк).
function parsePhotoPaths(v: unknown): string[] {
  if (!v) return [];
  try {
    const arr = JSON.parse(String(v));
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// Временная подписанная ссылка на файл в приватном бакете.
async function signedUrl(path: string): Promise<string | null> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return null;
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${PHOTOS_BUCKET}/${path}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: SIGNED_TTL }),
    }
  );
  if (!res.ok) return null;
  const j = await res.json();
  return j?.signedURL ? `${SUPABASE_URL}/storage/v1${j.signedURL}` : null;
}

// Отправка фото в группу: альбом / одно фото, с фолбэком на ссылки.
async function sendPhotos(paths: string[]) {
  const urls = (await Promise.all(paths.map(signedUrl))).filter(
    (u): u is string => !!u
  );
  if (urls.length === 0) return;

  let ok = false;
  if (urls.length === 1) {
    ok = (await tg("sendPhoto", { chat_id: CHAT_ID, photo: urls[0] })).ok;
  } else {
    ok = (
      await tg("sendMediaGroup", {
        chat_id: CHAT_ID,
        media: urls.map((u) => ({ type: "photo", media: u })),
      })
    ).ok;
  }

  // Фолбэк: если фото не ушли — шлём кликабельные ссылки текстом.
  if (!ok) {
    const text = "📷 Фото к заявке:\n" + urls.map((u, i) => `${i + 1}. ${u}`).join("\n");
    await tg("sendMessage", { chat_id: CHAT_ID, text, disable_web_page_preview: true });
  }
  console.log(`photos: ${urls.length}, delivered ${ok ? "album" : "links"}`);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  // Пускаем только вызовы с правильным секретом (его шлёт наш вебхук).
  if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("forbidden", { status: 403 });
  }
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("missing telegram secrets");
    return new Response("not configured", { status: 500 });
  }

  // deno-lint-ignore no-explicit-any
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }

  // Реагируем только на добавление новой строки.
  if (payload?.type !== "INSERT" || !payload?.record) {
    return new Response("ignored", { status: 200 });
  }

  const table = String(payload.table ?? "");
  const record = payload.record;

  // 1) текст заявки
  const text = buildMessage(table, record);
  const sent = await tg("sendMessage", {
    chat_id: CHAT_ID,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  console.log(`notify ${table}: telegram ${sent.status}`);

  // 2) фото (если приложены) — best-effort, ошибку заявки не роняем
  const paths = parsePhotoPaths(record.photo_urls);
  if (paths.length) {
    try {
      await sendPhotos(paths);
    } catch {
      console.log("photos: send failed");
    }
  }

  if (!sent.ok) return new Response("telegram error", { status: 502 });
  return new Response("ok", { status: 200 });
});
