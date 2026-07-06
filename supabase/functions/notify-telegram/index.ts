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
// ПДн не логируем: в консоль пишем только имя таблицы и статус Telegram.
// ------------------------------------------------------------------

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

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
  const text = buildMessage(table, payload.record);

  const tg = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  // Лог без ПДн — только таблица и код ответа Telegram.
  console.log(`notify ${table}: telegram ${tg.status}`);
  if (!tg.ok) {
    return new Response("telegram error", { status: 502 });
  }
  return new Response("ok", { status: 200 });
});
