"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { whatsappLink } from "@/lib/site";
import PhotoPicker from "@/components/PhotoPicker";
import { uploadLeadPhotos } from "@/lib/upload-photos";
import {
  priceMap,
  workLabels,
  carClasses,
  adjustPrice,
  formatPrice,
  type Operation,
} from "@/lib/calculator-pricing";
import {
  parts,
  partById,
  decor,
  bodyClipPath,
  presets,
} from "@/lib/calculator-parts";

// Системный fallback в конце нужен для символа тенге (₸): его нет в Unbounded,
// и без запасного шрифта он рендерится «последним-резервным» и выглядит криво.
const UB = "var(--font-unbounded), system-ui, sans-serif";
const MR = "var(--font-manrope), system-ui, sans-serif";

type Sel = Record<string, Operation>;

export default function CalculatorClient() {
  const [sel, setSel] = useState<Sel>({});
  const [active, setActive] = useState<string | null>(null);
  const [carClass, setCarClass] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [car, setCar] = useState("");
  const [consent, setConsent] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSent, setFormSent] = useState(false);

  const coef = carClasses[carClass].coef;
  const adj = (base: number) => adjustPrice(base, coef);

  const ids = Object.keys(sel);
  const count = ids.length;
  const hasSel = count > 0;
  const total = ids.reduce((a, id) => {
    const p = partById(id)!;
    return a + adj(priceMap[p.cat][sel[id]]);
  }, 0);
  const totalFmt = formatPrice(total);

  const classCaption =
    coef === 1 ? "базовые цены (седан)" : `цены с коэффициентом ×${coef}`;

  const chooseOp = (id: string, op: Operation) => {
    setSel((s) => ({ ...s, [id]: op }));
    setActive(null);
  };
  const removePart = (id: string) => {
    setSel((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
    setActive((a) => (a === id ? null : a));
  };
  const clearAll = () => {
    setSel({});
    setActive(null);
  };
  const applyPreset = (presetSel: Sel) => {
    setSel({ ...presetSel });
    setActive(null);
  };

  const openForm = () => {
    setFormSent(false);
    setError(null);
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const nameOk = name.trim().length > 0;
  const phoneOk = phone.trim().length >= 5;
  const valid = nameOk && phoneOk && consent;

  const submitLabel = loading
    ? "Отправляем…"
    : !nameOk || !phoneOk
    ? "Заполни имя и телефон"
    : !consent
    ? "Отметь согласие"
    : "Отправить заявку";

  function buildDescription(): string {
    const cls = carClasses[carClass];
    const head = `Класс авто: ${cls.label} (×${cls.coef})`;
    const body = hasSel
      ? `Позиции (${count}):\n` +
        ids
          .map((id) => {
            const p = partById(id)!;
            return `- ${p.full} — ${workLabels[sel[id]]} — ${formatPrice(
              adj(priceMap[p.cat][sel[id]])
            )}`;
          })
          .join("\n")
      : "Детали не выбраны";
    return `${head}\n${body}\nИтого предварительно: ${totalFmt}`;
  }

  async function submitForm() {
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      // Сначала грузим фото (если есть) — получаем пути в приватном бакете.
      const paths = await uploadLeadPhotos(photos);

      const supabase = getSupabase();
      const { error: insertError } = await supabase.from("leads").insert({
        name: name.trim() || null,
        phone: phone.trim(),
        car_make: car.trim() || null,
        service_type: "Калькулятор кузова",
        description: buildDescription(),
        photo_urls: paths.length ? JSON.stringify(paths) : null,
        source: "calculator",
      });
      if (insertError) throw insertError;
      setFormSent(true);
    } catch {
      // ПДн не логируем — только нейтральная ошибка.
      setError("Не получилось отправить. Попробуй ещё раз или напиши в WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- переиспользуемые куски ---------- */

  const eyebrow: React.CSSProperties = {
    font: `700 10px ${MR}`,
    letterSpacing: ".12em",
    color: "var(--metallic)",
    textTransform: "uppercase",
    marginBottom: 9,
  };

  const schema = (
    <div style={{ display: "flex", justifyContent: "center", padding: "18px 0 4px" }}>
      <div className="calc-scheme-outer">
        <div className="calc-scheme-scale">
          <div
            style={{
              position: "relative",
              width: 240,
              height: 340,
              background: "#eef0f3",
              clipPath: bodyClipPath,
            }}
          >
            {decor.map((d, i) => (
              <div key={i} style={d} />
            ))}
            {parts.map((p) => {
              const chosen = !!sel[p.id];
              const isActive = active === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActive((a) => (a === p.id ? null : p.id))}
                  style={{
                    position: "absolute",
                    top: p.pos.top,
                    left: p.pos.left,
                    width: p.pos.width,
                    height: p.pos.height,
                    borderRadius: p.pos.radius || "8px",
                    background: chosen ? "var(--electric)" : "#e2e5ea",
                    color: chosen ? "var(--electric-ink)" : "#98a0a9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    font: `700 9px ${MR}`,
                    lineHeight: 1.05,
                    padding: 2,
                    cursor: "pointer",
                    border: isActive ? "2px solid var(--graphite)" : "2px solid transparent",
                    transition: "background .15s, border-color .15s",
                  }}
                >
                  {p.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const actPart = active ? partById(active) : undefined;
  const picker = actPart && (
    <div
      style={{
        margin: "10px 0 0",
        background: "#fff",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 10px 30px -14px rgba(21,24,30,.28)",
        animation: "swapIn .22s ease",
      }}
    >
      <div style={{ font: `800 15px ${MR}`, marginBottom: 12 }}>{actPart.full}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {(["repair", "paint", "replace"] as Operation[]).map((w) => {
          const on = sel[actPart.id] === w;
          return (
            <div
              key={w}
              onClick={() => chooseOp(actPart.id, w)}
              style={{
                flex: 1,
                cursor: "pointer",
                borderRadius: 12,
                padding: "11px 6px",
                textAlign: "center",
                transition: "background .15s, border-color .15s",
                background: on ? "var(--graphite)" : "var(--bg-soft)",
                border: on ? "2px solid var(--graphite)" : "2px solid transparent",
              }}
            >
              <div style={{ font: `800 12.5px ${MR}`, color: on ? "#fff" : "var(--graphite)" }}>
                {workLabels[w]}
              </div>
              <div
                style={{
                  font: `700 10.5px ${MR}`,
                  color: on ? "var(--electric)" : "var(--metallic)",
                  marginTop: 3,
                }}
              >
                {formatPrice(adj(priceMap[actPart.cat][w]))}
              </div>
            </div>
          );
        })}
      </div>
      {sel[actPart.id] && (
        <div
          onClick={() => removePart(actPart.id)}
          style={{
            marginTop: 12,
            textAlign: "center",
            font: `700 12.5px ${MR}`,
            color: "var(--metallic)",
            cursor: "pointer",
          }}
        >
          убрать деталь из расчёта
        </div>
      )}
    </div>
  );

  const listRow = (id: string, withRemove: boolean) => {
    const p = partById(id)!;
    return (
      <div
        key={id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: withRemove ? "transparent" : "#fff",
          borderRadius: withRemove ? 0 : 13,
          borderBottom: withRemove ? "1px solid rgba(21,24,30,.05)" : undefined,
          padding: withRemove ? "10px 4px" : "12px 14px",
          boxShadow: withRemove ? undefined : "0 6px 18px -14px rgba(21,24,30,.16)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ font: `700 13.5px ${MR}` }}>{p.full}</div>
          <div style={{ font: `600 11.5px ${MR}`, color: "var(--metallic)", marginTop: 1 }}>
            {workLabels[sel[id]]}
          </div>
        </div>
        <div style={{ font: `800 13.5px ${MR}` }}>
          {formatPrice(adj(priceMap[p.cat][sel[id]]))}
        </div>
        {withRemove && (
          <div
            onClick={() => removePart(id)}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(21,24,30,.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: `700 13px ${MR}`,
              color: "var(--metallic)",
              cursor: "pointer",
            }}
          >
            ×
          </div>
        )}
      </div>
    );
  };

  const preliminaryNote = (
    <p style={{ margin: "16px 0 0", font: `500 12px/1.45 ${MR}`, color: "var(--metallic)" }}>
      Сумма предварительная — точную назовём после осмотра.
    </p>
  );

  /* ---------- разметка страницы ---------- */

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-soft)" }}>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(21,24,30,.06)",
          background: "rgba(244,245,247,.9)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ font: `700 20px ${MR}`, color: "var(--graphite)", textDecoration: "none" }}>
            ←
          </Link>
          <div style={{ font: `800 20px ${UB}`, letterSpacing: "-.01em" }}>
            RE<span style={{ color: "var(--electric)" }}>:</span>CAR
          </div>
        </div>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "var(--graphite)",
            color: "#fff",
            borderRadius: 22,
            padding: "8px 14px",
            font: `700 12px ${MR}`,
            textDecoration: "none",
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--electric)" }} />
          WhatsApp
        </a>
      </div>

      <div className="calc-container" style={{ paddingBottom: 40 }}>
        <div className="calc-layout">
          {/* MAIN */}
          <div className="calc-main">
            <div style={{ padding: "18px 22px 0" }}>
              <h1 style={{ margin: 0, font: `800 27px/1.08 ${UB}`, letterSpacing: "-.02em" }}>
                собери свой ремонт
              </h1>
              <p style={{ margin: "11px 0 0", font: `500 14px/1.5 ${MR}`, color: "var(--text-muted)" }}>
                Нажимай на детали кузова и выбирай, что с ними сделать — сумма считается сразу.
              </p>
            </div>

            {/* класс авто */}
            <div style={{ padding: "16px 22px 0" }}>
              <div style={eyebrow}>класс авто</div>
              <div style={{ display: "flex", gap: 8 }}>
                {carClasses.map((c, i) => {
                  const on = i === carClass;
                  return (
                    <div
                      key={c.label}
                      onClick={() => setCarClass(i)}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        cursor: "pointer",
                        borderRadius: 12,
                        padding: "11px 8px",
                        font: `700 13px ${MR}`,
                        whiteSpace: "nowrap",
                        transition: "background .2s, color .2s, border-color .2s",
                        background: on ? "var(--graphite)" : "transparent",
                        color: on ? "#fff" : "var(--graphite)",
                        border: on ? "2px solid var(--graphite)" : "2px solid rgba(21,24,30,.14)",
                      }}
                    >
                      {c.label}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 8, font: `600 11px ${MR}`, color: "var(--metallic)" }}>
                {classCaption}
              </div>
            </div>

            {/* пресеты */}
            <div style={{ padding: "16px 22px 0" }}>
              <div style={eyebrow}>частые случаи</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {presets.map((p) => (
                  <div
                    key={p.label}
                    onClick={() => applyPreset(p.sel)}
                    style={{
                      cursor: "pointer",
                      background: "#fff",
                      border: "1.5px solid rgba(21,24,30,.12)",
                      borderRadius: 22,
                      padding: "9px 15px",
                      font: `700 13px ${MR}`,
                      boxShadow: "0 6px 18px -14px rgba(21,24,30,.14)",
                    }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            {/* схема */}
            {schema}
            <div style={{ textAlign: "center", font: `600 11px ${MR}`, color: "var(--metallic)", marginBottom: 4 }}>
              вид сверху · нажми на деталь
            </div>

            {/* пикер */}
            <div style={{ padding: "0 16px" }}>{picker}</div>

            {/* список (только мобайл) + заглушка пустого */}
            <div className="hide-desktop">
              {hasSel ? (
                <>
                  <div
                    style={{
                      padding: "20px 20px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        font: `700 11px ${MR}`,
                        letterSpacing: ".14em",
                        color: "var(--metallic)",
                        textTransform: "uppercase",
                      }}
                    >
                      в расчёте · {count}
                    </div>
                    <div onClick={clearAll} style={{ font: `700 12px ${MR}`, color: "var(--metallic)", cursor: "pointer" }}>
                      очистить
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px 0" }}>
                    {ids.map((id) => listRow(id, false))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    margin: 16,
                    padding: "22px 16px",
                    border: "2px dashed rgba(21,24,30,.12)",
                    borderRadius: 16,
                    textAlign: "center",
                    font: `600 13px ${MR}`,
                    color: "var(--metallic)",
                  }}
                >
                  нажми на деталь кузова, чтобы начать расчёт
                </div>
              )}
              <div style={{ padding: "0 22px" }}>{preliminaryNote}</div>
            </div>

            {/* заметка (десктоп) */}
            <div className="hide-mobile" style={{ padding: "0 22px" }}>
              {preliminaryNote}
            </div>
          </div>

          {/* SIDEBAR (только десктоп) */}
          <div className="calc-side hide-mobile">
            <div
              style={{
                background: "#fff",
                borderRadius: 22,
                boxShadow: "0 14px 40px -18px rgba(21,24,30,.28)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "22px 22px 16px", borderBottom: "1px solid rgba(21,24,30,.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ font: `800 18px ${UB}`, letterSpacing: "-.01em" }}>твой расчёт</div>
                  {hasSel && (
                    <div onClick={clearAll} style={{ font: `700 12px ${MR}`, color: "var(--metallic)", cursor: "pointer" }}>
                      очистить
                    </div>
                  )}
                </div>
              </div>
              <div style={{ padding: "8px 16px", maxHeight: 280, overflowY: "auto" }}>
                {hasSel ? (
                  <div style={{ display: "flex", flexDirection: "column", padding: "8px 0" }}>
                    {ids.map((id) => listRow(id, true))}
                  </div>
                ) : (
                  <div style={{ padding: "30px 12px", textAlign: "center", font: `600 13.5px/1.5 ${MR}`, color: "var(--metallic)" }}>
                    Пока пусто. Нажми на деталь кузова слева.
                  </div>
                )}
              </div>
              <div style={{ padding: "18px 22px 22px", background: "var(--graphite)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ font: `700 11px ${MR}`, color: "var(--metallic)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                    предварительно
                  </div>
                  <div style={{ font: `800 28px ${UB}`, color: "#fff", letterSpacing: "-.02em" }}>{totalFmt}</div>
                </div>
                <button
                  onClick={openForm}
                  style={{
                    width: "100%",
                    height: 54,
                    marginTop: 16,
                    border: 0,
                    borderRadius: 14,
                    background: "var(--electric)",
                    color: "var(--electric-ink)",
                    font: `800 16px ${MR}`,
                    cursor: "pointer",
                  }}
                >
                  Оставить заявку
                </button>
                <p style={{ margin: "12px 0 0", font: `500 11.5px/1.4 ${MR}`, color: "var(--metallic)", textAlign: "center" }}>
                  Точную сумму назовём после осмотра.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* липкая нижняя панель (только мобайл) */}
      <div
        className="hide-desktop"
        style={{
          position: "sticky",
          bottom: 0,
          maxWidth: 430,
          margin: "0 auto",
          background: "var(--graphite)",
          padding: "16px 18px",
          borderRadius: "22px 22px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ font: `700 10px ${MR}`, color: "var(--metallic)", textTransform: "uppercase", letterSpacing: ".08em" }}>
            предварительно
          </div>
          <div style={{ font: `800 22px ${UB}`, color: "#fff", letterSpacing: "-.02em", marginTop: 2 }}>{totalFmt}</div>
        </div>
        <button
          onClick={openForm}
          style={{
            height: 52,
            padding: "0 22px",
            border: 0,
            borderRadius: 14,
            background: "var(--electric)",
            color: "var(--electric-ink)",
            font: `800 15px ${MR}`,
            cursor: "pointer",
          }}
        >
          Оставить заявку
        </button>
      </div>

      {/* форма заявки */}
      {formOpen && (
        <div className="calc-form-overlay" onClick={closeForm}>
          <div className="calc-form-panel" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 20px 8px",
              }}
            >
              <div style={{ font: `800 18px ${UB}`, letterSpacing: "-.01em" }}>заявка на ремонт</div>
              <div
                onClick={closeForm}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(21,24,30,.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: `400 20px ${MR}`,
                  cursor: "pointer",
                }}
              >
                ×
              </div>
            </div>

            {formSent ? (
              <div style={{ padding: "20px 24px 40px", textAlign: "center" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    margin: "0 auto",
                    borderRadius: "50%",
                    background: "var(--electric)",
                    color: "var(--electric-ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: `800 27px ${MR}`,
                  }}
                >
                  ✓
                </div>
                <h3 style={{ margin: "18px 0 0", font: `800 21px ${UB}`, letterSpacing: "-.02em" }}>
                  заявка принята
                </h3>
                <p style={{ margin: "11px auto 0", maxWidth: 280, font: `500 14px/1.55 ${MR}`, color: "var(--text-muted)" }}>
                  Ответим в WhatsApp в течение 15 минут в рабочее время.
                </p>
                <button
                  onClick={closeForm}
                  style={{
                    width: "100%",
                    height: 52,
                    marginTop: 24,
                    border: 0,
                    borderRadius: 14,
                    background: "var(--graphite)",
                    color: "#fff",
                    font: `800 15px ${MR}`,
                    cursor: "pointer",
                  }}
                >
                  Готово
                </button>
              </div>
            ) : (
              <>
                <div style={{ padding: "6px 22px 0" }}>
                  {/* итог расчёта */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 13,
                      padding: "12px 14px",
                      boxShadow: "0 6px 18px -14px rgba(21,24,30,.16)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <span style={{ font: `700 13px ${MR}`, color: "var(--metallic)" }}>
                      {count} деталей · предварительно
                    </span>
                    <span style={{ font: `800 15px ${MR}`, color: "var(--electric-deep)" }}>{totalFmt}</span>
                  </div>

                  {/* фото повреждений */}
                  <div style={{ marginBottom: 16 }}>
                    <PhotoPicker files={photos} onChange={setPhotos} disabled={loading} />
                  </div>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как тебя зовут"
                    style={fieldStyle}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    placeholder="+7 (___) ___-__-__"
                    style={{ ...fieldStyle, marginTop: 10 }}
                  />
                  <input
                    value={car}
                    onChange={(e) => setCar(e.target.value)}
                    placeholder="Марка и модель авто"
                    style={{ ...fieldStyle, marginTop: 10 }}
                  />

                  {/* согласие на ПДн */}
                  <label style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "14px 0 0", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      style={{ width: 18, height: 18, marginTop: 1, flex: "none", accentColor: "#17e3c2" }}
                    />
                    <span style={{ font: `500 12.5px/1.5 ${MR}`, color: "var(--text-muted)" }}>
                      Я согласен(а) на обработку персональных данных и ознакомлен(а) с{" "}
                      <Link href="/privacy" target="_blank" style={{ color: "var(--electric-deep)", textDecoration: "underline" }}>
                        политикой конфиденциальности
                      </Link>
                      .
                    </span>
                  </label>

                  {error && (
                    <div style={{ margin: "14px 0 0", font: `600 12.5px/1.4 ${MR}`, color: "var(--amber)" }}>
                      {error}
                    </div>
                  )}
                </div>

                <div style={{ padding: "18px 22px 32px" }}>
                  <button
                    onClick={submitForm}
                    disabled={!valid || loading}
                    style={{
                      width: "100%",
                      height: 56,
                      border: 0,
                      borderRadius: 15,
                      font: `800 16px ${MR}`,
                      cursor: valid && !loading ? "pointer" : "default",
                      background: valid && !loading ? "var(--electric)" : "#dfe2e7",
                      color: valid && !loading ? "var(--electric-ink)" : "#98a0a9",
                      transition: "background .2s",
                    }}
                  >
                    {submitLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  background: "#fff",
  border: 0,
  borderRadius: 13,
  padding: "0 15px",
  font: `600 15px ${MR}`,
  color: "var(--graphite)",
  boxShadow: "0 6px 18px -14px rgba(21,24,30,.16)",
  outline: "none",
};
