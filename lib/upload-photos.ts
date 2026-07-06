import { getSupabase } from "@/lib/supabase";

/**
 * Загрузка фото повреждений в приватный бакет lead-photos.
 * Возвращает пути к файлам (их кладём в leads.photo_urls как JSON-массив).
 *
 * Бакет приватный: сайт (anon) может только ЗАГРУЖАТЬ, но не читать/листать.
 * Ссылки для просмотра генерит сервер (Edge Function) через подписанные URL.
 */

export const LEAD_PHOTOS_BUCKET = "lead-photos";
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE = 8 * 1024 * 1024; // 8 МБ
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadLeadPhotos(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const supabase = getSupabase();
  // Случайная папка на каждую заявку — путь не угадать снаружи.
  const folder = crypto.randomUUID();
  const paths: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${folder}/${i}.${ext}`;
    const { error } = await supabase.storage
      .from(LEAD_PHOTOS_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    paths.push(path);
  }

  return paths;
}
