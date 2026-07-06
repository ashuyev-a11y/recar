-- ============================================================
-- RE:CAR — схема базы данных (Supabase / PostgreSQL)
-- Проект: khkwkbvbunqslfihuyfx
--
-- Как применить:
--   1. Открой Supabase → свой проект → SQL Editor → New query.
--   2. Скопируй сюда ВЕСЬ этот файл и нажми Run.
--   3. Скрипт можно запускать повторно — он не ломает уже созданное
--      (используются IF NOT EXISTS и пересоздание политик).
--
-- Модель безопасности (RLS):
--   • Формы на сайте работают под anon-ключом (роль "anon").
--   • anon может ТОЛЬКО добавлять записи (INSERT) — отправка заявок.
--   • ЧТЕНИЕ из браузера запрещено: политик SELECT нет,
--     поэтому данные клиентов наружу не отдаются.
--   • Чтение статуса заказа по номеру (orders) добавим ОТДЕЛЬНО,
--     вместе с трекингом — сейчас orders тоже только INSERT.
-- ============================================================

-- ---------- Таблица: leads (заявки / оценка по фото) ----------
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  phone        text not null,
  car_make     text,
  car_model    text,
  service_type text,
  description  text,
  photo_urls   text,
  source       text default 'form',
  status       text default 'new',
  created_at   timestamptz default now()
);

-- ---------- Таблица: bookings (запись на слот) ----------
create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  phone        text not null,
  service_type text,
  preferred_at text,
  comment      text,
  status       text default 'new',
  created_at   timestamptz default now()
);

-- ---------- Таблица: orders (заказы для трекинга ремонта) ----------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text unique,
  phone         text,
  car_info      text,
  current_stage text default 'accepted',
  stages_json   text,
  created_at    timestamptz default now()
);

-- ============================================================
-- Включаем Row Level Security на всех таблицах.
-- Пока не создана ни одна политика — доступа нет НИ У КОГО
-- (кроме service_role, который RLS обходит). Политики ниже
-- аккуратно открывают ровно то, что нужно.
-- ============================================================
alter table public.leads    enable row level security;
alter table public.bookings enable row level security;
alter table public.orders   enable row level security;

-- ---------- Политики: разрешаем anon только INSERT ----------
-- drop ... if exists делает скрипт безопасным для повторного запуска.

drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

drop policy if exists "anon insert bookings" on public.bookings;
create policy "anon insert bookings"
  on public.bookings
  for insert
  to anon
  with check (true);

drop policy if exists "anon insert orders" on public.orders;
create policy "anon insert orders"
  on public.orders
  for insert
  to anon
  with check (true);

-- ============================================================
-- ЧТО НАМЕРЕННО НЕ СДЕЛАНО (заложено на будущее):
--   • Нет политик SELECT / UPDATE / DELETE для anon —
--     значит из браузера данные читать/менять нельзя.
--   • Чтение статуса заказа по order_number (трекинг) —
--     отдельный шаг: сделаем через серверный роут или
--     узкую RPC-функцию, чтобы не открывать всю таблицу.
-- ============================================================
