"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import PhotoPicker from "@/components/PhotoPicker";
import { uploadLeadPhotos } from "@/lib/upload-photos";

const UB = "var(--font-unbounded)";
const MR = "var(--font-manrope)";

type Props = {
  /** Что за услуга — попадёт в service_type заявки. */
  serviceType?: string;
  /** Заголовок формы. */
  title?: string;
  /** Подсказка над формой. */
  intro?: string;
  onClose: () => void;
};

export default function LeadForm({
  serviceType = "Заявка с сайта",
  title = "оставить заявку",
  intro = "Оставь контакты и опиши, что с авто — ответим в WhatsApp в течение 15 минут в рабочее время.",
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const input: React.CSSProperties = {
    width: "100%",
    height: 48,
    background: "#fff",
    border: 0,
    borderRadius: 14,
    padding: "0 14px",
    font: `500 14.5px ${MR}`,
    color: "var(--graphite)",
    boxShadow: "0 6px 18px -14px rgba(21,24,30,.16)",
    outline: "none",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError("Укажи номер телефона — иначе мы не сможем ответить.");
      return;
    }
    if (!consent) {
      setError("Отметь согласие на обработку персональных данных.");
      return;
    }

    setLoading(true);
    try {
      // Сначала грузим фото (если есть) — пути в приватном бакете.
      const paths = await uploadLeadPhotos(photos);

      const supabase = getSupabase();
      const { error: insertError } = await supabase.from("leads").insert({
        name: name.trim() || null,
        phone: phone.trim(),
        car_make: carMake.trim() || null,
        car_model: carModel.trim() || null,
        service_type: serviceType,
        description: description.trim() || null,
        photo_urls: paths.length ? JSON.stringify(paths) : null,
        source: "form",
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (err) {
      // Не логируем ПДн. Показываем нейтральную ошибку.
      setError(
        "Не получилось отправить. Попробуй ещё раз или напиши нам в WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: "30px 24px 40px", textAlign: "center" }}>
        <div
          style={{
            width: 62,
            height: 62,
            margin: "0 auto",
            borderRadius: "50%",
            background: "var(--electric)",
            color: "var(--electric-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: `800 28px ${MR}`,
          }}
        >
          ✓
        </div>
        <h3
          style={{
            margin: "20px 0 0",
            font: `800 22px/1.1 ${UB}`,
            letterSpacing: "-.02em",
          }}
        >
          заявка у мастера
        </h3>
        <p
          style={{
            margin: "12px auto 0",
            maxWidth: 280,
            font: `500 14px/1.55 ${MR}`,
            color: "var(--text-muted)",
          }}
        >
          Ответим в WhatsApp в течение 15 минут в рабочее время.
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: 54,
            marginTop: 26,
            border: 0,
            borderRadius: 15,
            background: "var(--graphite)",
            color: "#fff",
            font: `800 15px ${MR}`,
            cursor: "pointer",
          }}
        >
          Готово
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: "4px 22px 34px" }}>
      <p
        style={{
          margin: "0 0 16px",
          font: `500 14px/1.5 ${MR}`,
          color: "var(--text-muted)",
        }}
      >
        {intro}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          style={input}
          placeholder="Как тебя зовут"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={input}
          type="tel"
          inputMode="tel"
          placeholder="Телефон *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={input}
            placeholder="Марка (Toyota…)"
            value={carMake}
            onChange={(e) => setCarMake(e.target.value)}
          />
          <input
            style={input}
            placeholder="Модель (Camry…)"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
          />
        </div>
        <textarea
          placeholder="Что случилось? Например: вмятина на заднем крыле и царапина на бампере"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            minHeight: 80,
            resize: "none",
            background: "#fff",
            border: 0,
            borderRadius: 14,
            padding: 14,
            font: `500 14px/1.5 ${MR}`,
            color: "var(--graphite)",
            boxShadow: "0 6px 18px -14px rgba(21,24,30,.16)",
            outline: "none",
          }}
        />
      </div>

      {/* Фото повреждений */}
      <div style={{ margin: "14px 0 0" }}>
        <PhotoPicker files={photos} onChange={setPhotos} disabled={loading} />
      </div>

      {/* Согласие на обработку ПДн — обязательно (Казахстан) */}
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          margin: "16px 0 0",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 1, flex: "none", accentColor: "#17e3c2" }}
        />
        <span style={{ font: `500 12.5px/1.5 ${MR}`, color: "var(--text-muted)" }}>
          Я согласен(а) на обработку моих персональных данных и ознакомлен(а) с{" "}
          <Link
            href="/privacy"
            target="_blank"
            style={{ color: "var(--electric-deep)", textDecoration: "underline" }}
          >
            политикой конфиденциальности
          </Link>
          .
        </span>
      </label>

      {error && (
        <div
          style={{
            margin: "14px 0 0",
            font: `600 12.5px/1.4 ${MR}`,
            color: "var(--amber)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          height: 56,
          marginTop: 18,
          border: 0,
          borderRadius: 15,
          background: loading ? "#a7ece0" : "var(--electric)",
          color: "var(--electric-ink)",
          font: `800 16px ${MR}`,
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
