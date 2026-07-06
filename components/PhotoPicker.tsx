"use client";

import { useEffect, useRef, useState } from "react";
import {
  MAX_PHOTOS,
  MAX_PHOTO_SIZE,
  ACCEPTED_TYPES,
} from "@/lib/upload-photos";

const MR = "var(--font-manrope), system-ui, sans-serif";

/**
 * Выбор фото повреждений (1–5), с превью и удалением.
 * Контролируемый компонент: список File[] хранит родитель-форма.
 * accept="image/*" без capture — телефон сам предложит камеру или галерею.
 */
export default function PhotoPicker({
  files,
  onChange,
  disabled,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Превью через object-URL; чистим при смене набора/размонтировании.
  useEffect(() => {
    const made = files.map((f) => URL.createObjectURL(f));
    setUrls(made);
    return () => made.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // чтобы можно было выбрать тот же файл снова
    const problems = new Set<string>();

    const valid = picked.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        problems.add("только jpg, png или webp");
        return false;
      }
      if (f.size > MAX_PHOTO_SIZE) {
        problems.add("каждое фото до 8 МБ");
        return false;
      }
      return true;
    });

    let next = [...files, ...valid];
    if (next.length > MAX_PHOTOS) {
      problems.add(`максимум ${MAX_PHOTOS} фото`);
      next = next.slice(0, MAX_PHOTOS);
    }
    setErr(problems.size ? [...problems].join(" · ") : null);
    onChange(next);
  }

  function remove(i: number) {
    onChange(files.filter((_, j) => j !== i));
    setErr(null);
  }

  const canAdd = files.length < MAX_PHOTOS && !disabled;

  const tile: React.CSSProperties = {
    position: "relative",
    width: 62,
    height: 62,
    borderRadius: 12,
    overflow: "hidden",
    background: "#e6e8ec",
    flex: "none",
  };

  return (
    <div>
      <div style={{ font: `700 12px ${MR}`, color: "var(--metallic)", marginBottom: 8 }}>
        фото повреждений (по желанию, до {MAX_PHOTOS})
      </div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        {files.map((_, i) => (
          <div key={i} style={tile}>
            {urls[i] && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${urls[i]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div
              onClick={() => remove(i)}
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(21,24,30,.78)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: `700 12px ${MR}`,
                cursor: "pointer",
              }}
            >
              ×
            </div>
          </div>
        ))}
        {canAdd && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              ...tile,
              background: "transparent",
              border: "2px dashed rgba(21,24,30,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: `400 24px ${MR}`,
              color: "var(--metallic)",
              cursor: "pointer",
            }}
          >
            +
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdd}
          style={{ display: "none" }}
        />
      </div>
      {err && (
        <div style={{ marginTop: 8, font: `600 11.5px ${MR}`, color: "var(--amber)" }}>{err}</div>
      )}
    </div>
  );
}
