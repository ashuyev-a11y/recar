import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Клиент Supabase для RE:CAR.
 *
 * Использует ТОЛЬКО публичный anon-ключ — он безопасен для браузера,
 * потому что доступ к данным ограничен политиками RLS в базе.
 *
 * service_role сюда НЕ попадает никогда: он обходит RLS и даёт полный
 * доступ к базе. Для серверных задач (админка) заведём отдельный
 * серверный модуль позже.
 *
 * Клиент создаётся лениво — при первом вызове getSupabase(), а не при
 * импорте файла. Это значит: если ключи в .env.local ещё не заполнены,
 * страница всё равно откроется, а понятная ошибка появится только при
 * попытке отправить форму (и мы её ловим).
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Не заданы NEXT_PUBLIC_SUPABASE_URL и/или NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Заполни .env.local (локально) и переменные окружения в Vercel (продакшн)."
    );
  }

  client = createClient(url, key);
  return client;
}
