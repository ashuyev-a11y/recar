@AGENTS.md

# RE:CAR — проект-справка

Автосервис полного цикла в Уральске (ЗКО): кузовной ремонт, покраска, детейлинг, химчистка.
Mobile-first сайт. Ключевая идея бренда — клиент видит цену заранее и следит за ремонтом онлайн.

## Стек и инфраструктура
- **Next.js 16** (App Router, TypeScript, Tailwind v4, Turbopack). ⚠️ это НЕ привычный Next — см. `AGENTS.md`, сверяйся с докой в `node_modules/next/dist/docs/`.
- **Supabase** — проект `khkwkbvbunqslfihuyfx` (ОТДЕЛЬНЫЙ от проекта ассенизации, не путать). URL: `https://khkwkbvbunqslfihuyfx.supabase.co`.
- **Vercel** — проект `recar`, аккаунт `ashuyev-a11y`. Пуш в `main` → автодеплой.
- **Репозиторий** — github.com/ashuyev-a11y/recar, ветка `main`.

### Переменные окружения
- `.env.local` (локально, не в git): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Те же — в Vercel.
- **Только anon-ключ в браузере.** `service_role` в браузерный код — НИКОГДА (он обходит RLS).

## Структура
```
app/
  layout.tsx        — шрифты (Unbounded/Manrope), метаданные, lang=ru
  globals.css       — фирменные токены (CSS-переменные) + адаптивные классы калькулятора
  page.tsx          — главная (рендерит <Landing/>)
  calculator/       — калькулятор кузовного ремонта (рабочий)
  tracking/         — заглушка «скоро» (трекинг ремонта — пока не сделан)
  privacy/          — политика конфиденциальности (шаблон под ПДн Казахстана)
components/
  Landing.tsx       — лендинг (все секции, лёгкие интеракции)
  LeadForm.tsx      — форма заявки (модалка на главной) → пишет в leads
  CalculatorClient.tsx — интерактивный калькулятор
  PhotoPicker.tsx   — выбор 1–5 фото (превью, лимиты, камера/галерея)
  ComingSoon.tsx    — переиспользуемая заглушка «скоро»
lib/
  supabase.ts       — ленивый клиент (только anon-ключ)
  site.ts           — контакты/плейсхолдеры бизнеса (телефон, адрес, WhatsApp…)
  calculator-pricing.ts — ЦЕНЫ калькулятора (заглушка; менять числа ЗДЕСЬ)
  calculator-parts.ts   — геометрия схемы кузова + пресеты
  upload-photos.ts  — загрузка фото в бакет lead-photos
supabase/functions/notify-telegram/ — Edge Function уведомлений (Deno)
```

## База данных (Supabase)
Таблицы: **leads** (заявки/оценка/калькулятор), **bookings** (запись на слот), **orders** (трекинг, на будущее).
- Схема — в `supabase/schema.sql`.
- **RLS включён на всех.** Политика — только **INSERT для anon** (формы отправляют, но данные клиентов из браузера НЕ читаются). Не менять без причины.
- `leads.photo_urls` — JSON-массив путей к фото в бакете.

### Storage
- Приватный бакет **`lead-photos`** (public=false, лимит 8 МБ, jpg/png/webp). Политика: anon только **INSERT** (не листинг/чтение). Фото в папках со случайным UUID.
- ⚠️ Удалять файлы из бакета можно ТОЛЬКО через Storage API или дашборд — прямой SQL-delete блокирует триггер `storage.protect_delete`.

### Уведомления в Telegram
- Edge Function `notify-telegram` (`verify_jwt=off`) + триггеры `leads_to_telegram`/`bookings_to_telegram` на INSERT (через pg_net → функция).
- Функция шлёт текст заявки, а при наличии фото — альбом (подписанные ссылки, TTL 3600с; фолбэк на ссылки).
- Секреты в Supabase (Edge Functions → Secrets, НЕ в git): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (-5373399519), `WEBHOOK_SECRET`. `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` Supabase отдаёт функции сам.
- Бот @Recaruralsk_bot, группа «Re:car».

## Фирменный стиль (строго из бренд-брифа)
- Графит `#15181E`, электрик-аква `#17E3C2` (акцент, дозированно), янтарь `#FF6A2B` (только акции/сигнальное).
- Шрифты: заголовки **Unbounded** (800), текст **Manrope** — через next/font, с кириллицей.
- Тон на «ты», **sentence case** (без ЗАГЛАВНЫХ и Каждого Слова). Контейнер mobile-first, max-width 430px.
- Токены — CSS-переменные в `app/globals.css`.

## Команды
- `npm run dev` — локальная разработка (http://localhost:3000).
- `npm run build` — прод-сборка (её же гоняет Vercel).

## Важные грабли (проверено на практике)
- **Автор коммита для Vercel:** Hobby-план собирает только коммиты владельца. `git user.email` в репозитории уже настроен на GitHub no-reply аккаунта `ashuyev-a11y`. Для новых репозиториев/машин выставляй его же, иначе Vercel заблокирует деплой.
- **tsconfig исключает `supabase/`** — иначе `next build` падает на Deno-коде функции (`Deno` не определён в Next).
- **Символ тенге ₸** нет в Unbounded — в стилях сумм шрифт с системным fallback (`var(--font-*), system-ui, sans-serif`), иначе ₸ рисуется криво.
- Фото/телефон — ПДн: **не логировать**, наружу не отдавать.

## Статус (что готово / что дальше)
Готово: лендинг, формы заявок → leads, политика конфиденциальности, калькулятор кузовного ремонта (класс авто, пресеты, живой расчёт), прикрепление фото, уведомления в Telegram (текст + альбом).
Дальше (заглушки/на будущее): **трекинг ремонта** (`/tracking`; понадобится чтение `orders` по `order_number` — узкой RLS/RPC/серверным роутом, НЕ открывать всю таблицу), **запись на слот** (bookings, слот-пикер), реальный прайс в `lib/calculator-pricing.ts`, реальные контакты в `lib/site.ts`.

## Действия за владельцем (напоминание)
- Перевыпустить токен бота (@BotFather → `/revoke`) и обновить секрет `TELEGRAM_BOT_TOKEN` — старый светился в переписке.
- Отозвать личный Supabase access-token, если он больше не нужен (использовался для настройки Storage/функции/секретов).
