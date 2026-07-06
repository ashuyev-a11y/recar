"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import { site, whatsappLink } from "@/lib/site";

const UB = "var(--font-unbounded)";
const MR = "var(--font-manrope)";

/* ---------- данные (позже вынесем в CMS/конфиг) ---------- */

const services = [
  {
    id: "body",
    pill: "Кузов",
    eyebrow: "Кузовной ремонт",
    title: "вмятины, сколы, ДТП",
    sub: "Устраняем последствия ДТП — от лёгких царапин до восстановления геометрии кузова.",
    cta: "Открыть калькулятор",
    soon: false,
    action: "calc" as const,
  },
  {
    id: "paint",
    pill: "Покраска",
    eyebrow: "Покраска",
    title: "цвет точно в тон",
    sub: "Компьютерный подбор оттенка по коду авто. Покраска без границ между новой и старой краской.",
    cta: "Рассчитать по фото",
    soon: false,
    action: "lead" as const,
  },
  {
    id: "detail",
    pill: "Детейлинг",
    eyebrow: "Детейлинг",
    title: "блеск как из салона",
    sub: "Полировка, керамика, защита ЛКП. Возвращаем блеск и защищаем от солнца и реагентов.",
    cta: "Записаться",
    soon: true,
    action: "lead" as const,
  },
  {
    id: "clean",
    pill: "Химчистка",
    eyebrow: "Химчистка салона",
    title: "салон как новый",
    sub: "Глубокая чистка сидений, обивки и пластика. Салон как из автосалона.",
    cta: "Записаться",
    soon: true,
    action: "lead" as const,
  },
];
const pillSizes = [21, 17, 16, 15];

const why = [
  {
    n: "1",
    title: "цену знаешь заранее",
    short: "Предварительный расчёт по фото — без «приедете, там посмотрим».",
    detail:
      "Пришли 2–3 фото повреждения при дневном свете — мастер вернёт вилку цены и сроки. Финальная сумма фиксируется после осмотра и дороже не станет.",
  },
  {
    n: "2",
    title: "видишь каждый этап",
    short: "Фото и видео работ приходят прямо в WhatsApp.",
    detail:
      "На каждом шаге — разборка, подготовка, покраска, сборка — тебе автоматически падает фото и видео в WhatsApp. Как трекер пиццы, только для ремонта.",
  },
  {
    n: "3",
    title: "отвечаем за результат",
    short: "Письменная гарантия и цифровой QR-сертификат на работы.",
    detail:
      "Гарантия оформляется письменно, а QR-сертификат хранит историю работ и условия — просто отсканируй камерой телефона.",
  },
  {
    n: "4",
    title: "удобно платить",
    short: "Kaspi, QR и рассрочка Kaspi Red — без барьера для дорогого ремонта.",
    detail:
      "Оплата картой, Kaspi QR или рассрочка Kaspi Red до 24 месяцев. Дорогой ремонт можно разбить на части без переплаты по акции.",
  },
];

const reviews = [
  {
    name: "Айгерим",
    src: "2GIS",
    text: "Восстановили бампер после парковки — цвет в тон, не отличить. Присылали фото каждого этапа в WhatsApp.",
  },
  {
    name: "Данияр",
    src: "Instagram",
    text: "Красили дверь и крыло. Цену сказали сразу по фото, по факту столько и вышло. Рекомендую.",
  },
  {
    name: "Ольга",
    src: "2GIS",
    text: "Делали керамику. Машина блестит как новая, менеджер был на связи постоянно.",
  },
];

type LeadState = { serviceType: string; title: string; intro?: string } | null;

export default function Landing() {
  const [svc, setSvc] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [ba, setBa] = useState(52);
  const [lead, setLead] = useState<LeadState>(null);

  const baRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const cur = services[svc];

  const openLead = (serviceType: string, title = "оставить заявку", intro?: string) =>
    setLead({ serviceType, title, intro });

  /* before/after slider */
  const setBaFromX = (clientX: number) => {
    const el = baRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setBa(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  const eyebrow: React.CSSProperties = {
    font: `700 11px ${MR}`,
    letterSpacing: ".14em",
    color: "var(--metallic)",
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: "var(--bg-soft)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* STICKY HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          background: "rgba(244,245,247,.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(21,24,30,.06)",
        }}
      >
        <div style={{ font: `800 21px ${UB}`, letterSpacing: "-.01em" }}>
          RE<span style={{ color: "var(--electric)" }}>:</span>CAR
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
            padding: "9px 15px",
            font: `700 12.5px ${MR}`,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--electric)",
              display: "inline-block",
            }}
          />
          WhatsApp
        </a>
      </div>

      {/* HERO */}
      <div style={{ padding: "30px 22px 6px" }}>
        <div style={{ ...eyebrow, marginBottom: 14 }}>
          Кузов · покраска · детейлинг · Уральск
        </div>
        <h1 style={{ margin: 0, font: `800 42px/1.02 ${UB}`, letterSpacing: "-.03em" }}>
          твоё авто —<br />
          как <span style={{ color: "var(--electric)" }}>новое</span>
        </h1>
        <p
          style={{
            margin: "18px 0 22px",
            font: `500 15.5px/1.55 ${MR}`,
            color: "var(--text-muted)",
          }}
        >
          Кузовной ремонт и покраска в Уральске. Пришли фото повреждений — узнаешь
          цену за 5 минут.
        </p>
        <button
          onClick={() => openLead("Оценка по фото")}
          style={{
            width: "100%",
            height: 58,
            border: 0,
            borderRadius: 16,
            background: "var(--electric)",
            color: "var(--electric-ink)",
            font: `800 17px ${MR}`,
            cursor: "pointer",
          }}
        >
          Рассчитать по фото
        </button>
        <button
          onClick={() => openLead("Запись")}
          style={{
            width: "100%",
            height: 58,
            marginTop: 11,
            border: "1.5px solid var(--graphite)",
            borderRadius: 16,
            background: "transparent",
            color: "var(--graphite)",
            font: `700 17px ${MR}`,
            cursor: "pointer",
          }}
        >
          Записаться
        </button>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 16px",
            justifyContent: "center",
            marginTop: 22,
            font: `600 12.5px ${MR}`,
            color: "var(--metallic)",
          }}
        >
          <span>Оценка по фото</span>
          <span style={{ color: "#c9ccd3" }}>·</span>
          <span>Гарантия на работы</span>
          <span style={{ color: "#c9ccd3" }}>·</span>
          <span>Рассрочка Kaspi</span>
        </div>
      </div>

      {/* HERO PHOTO */}
      <div
        style={{
          margin: "24px 16px 0",
          height: 230,
          borderRadius: 22,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div className="plc" style={{ position: "absolute", inset: 0, backgroundColor: "#e6e8ec" }}>
          фото авто
        </div>
      </div>

      {/* SERVICES — pill switcher */}
      <div style={{ padding: "40px 22px 4px" }}>
        <div style={{ ...eyebrow, marginBottom: 14 }}>услуги</div>
        <h2 style={{ margin: "0 0 18px", font: `800 28px/1.08 ${UB}`, letterSpacing: "-.02em" }}>
          выбери, что нужно
        </h2>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 11,
          padding: "0 20px 4px",
          alignItems: "center",
        }}
      >
        {services.map((s, i) => {
          const on = i === svc;
          return (
            <button
              key={s.id}
              onClick={() => setSvc(i)}
              style={{
                flex: "none",
                borderRadius: 26,
                padding: "13px 22px",
                font: `800 ${pillSizes[i]}px ${MR}`,
                letterSpacing: "-.01em",
                lineHeight: 1,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background .2s, color .2s, border-color .2s",
                background: on ? "var(--graphite)" : "transparent",
                color: on ? "#fff" : "var(--graphite)",
                border: on ? "2px solid var(--graphite)" : "2px solid rgba(21,24,30,.16)",
              }}
            >
              {s.pill}
            </button>
          );
        })}
      </div>
      <div key={svc} style={{ animation: "swapIn .32s ease", padding: "18px 22px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <span style={{ ...eyebrow, letterSpacing: ".12em" }}>{cur.eyebrow}</span>
          {cur.soon && (
            <span
              style={{
                background: "var(--amber)",
                color: "#fff",
                font: `800 9px ${MR}`,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                padding: "3px 7px",
                borderRadius: 20,
              }}
            >
              скоро
            </span>
          )}
        </div>
        <h3 style={{ margin: 0, font: `800 24px/1.12 ${UB}`, letterSpacing: "-.02em" }}>
          {cur.title}
        </h3>
        <p style={{ margin: "12px 0 16px", font: `500 14.5px/1.55 ${MR}`, color: "var(--text-muted)" }}>
          {cur.sub}
        </p>
        {cur.action === "calc" ? (
          <Link
            href="/calculator"
            style={{
              display: "inline-block",
              height: 50,
              lineHeight: "50px",
              padding: "0 22px",
              borderRadius: 14,
              background: "var(--graphite)",
              color: "#fff",
              font: `800 14.5px ${MR}`,
              textDecoration: "none",
            }}
          >
            {cur.cta}
          </Link>
        ) : (
          <button
            onClick={() => openLead(cur.eyebrow)}
            style={{
              height: 50,
              padding: "0 22px",
              border: 0,
              borderRadius: 14,
              background: "var(--graphite)",
              color: "#fff",
              font: `800 14.5px ${MR}`,
              cursor: "pointer",
            }}
          >
            {cur.cta}
          </button>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div
        style={{
          marginTop: 38,
          background: "var(--graphite)",
          color: "#fff",
          borderRadius: "28px 28px 0 0",
          padding: "34px 22px 30px",
        }}
      >
        <div style={{ ...eyebrow, color: "var(--electric)", marginBottom: 12 }}>
          как это работает
        </div>
        <h2 style={{ margin: "0 0 24px", font: `800 27px/1.1 ${UB}`, letterSpacing: "-.02em" }}>
          от фото до готового
          <br />
          авто — 4 шага
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {[
            ["01", "Присылаешь фото", "Фото повреждений в WhatsApp или через сайт."],
            ["02", "Получаешь расчёт", "Мастер считает предварительную стоимость и сроки."],
            ["03", "Пригоняешь авто", "Фиксируем финальную цену после осмотра — дороже не станет."],
            ["04", "Следишь и забираешь", "Статус ремонта онлайн, машина с гарантией."],
          ].map(([num, t, d]) => (
            <div key={num} style={{ display: "flex", gap: 15 }}>
              <div style={{ font: `800 22px ${UB}`, color: "var(--electric)", flex: "none", width: 34 }}>
                {num}
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ font: `700 16px ${MR}` }}>{t}</div>
                <p style={{ margin: "5px 0 0", font: `500 13.5px/1.5 ${MR}`, color: "var(--text-on-dark)" }}>
                  {d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY — accordion */}
      <div style={{ padding: "38px 22px 4px" }}>
        <div style={{ ...eyebrow, marginBottom: 12 }}>почему re:car</div>
        <h2 style={{ margin: 0, font: `800 28px/1.08 ${UB}`, letterSpacing: "-.02em" }}>
          всё понятно <span style={{ color: "var(--electric)" }}>заранее</span>
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, padding: "20px 16px 4px" }}>
        {why.map((c, i) => {
          const open = expanded === i;
          return (
            <div
              key={c.n}
              onClick={() => setExpanded(open ? null : i)}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "17px 17px 18px",
                boxShadow: "0 8px 24px -14px rgba(21,24,30,.16)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flex: "none",
                    borderRadius: 12,
                    background: "var(--electric)",
                    color: "var(--electric-ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: `800 16px ${UB}`,
                  }}
                >
                  {c.n}
                </div>
                <div style={{ flex: 1, font: `800 18px/1.1 ${UB}`, letterSpacing: "-.01em" }}>
                  {c.title}
                </div>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    flex: "none",
                    borderRadius: "50%",
                    background: open ? "var(--graphite)" : "rgba(21,24,30,.07)",
                    color: open ? "var(--electric)" : "var(--metallic)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: `700 17px ${MR}`,
                    transition: "background .2s, color .2s",
                  }}
                >
                  {open ? "−" : "+"}
                </div>
              </div>
              <p style={{ margin: "11px 0 0", font: `500 14px/1.5 ${MR}`, color: "var(--text-muted)" }}>
                {c.short}
              </p>
              {open && (
                <p
                  style={{
                    margin: "11px 0 0",
                    paddingTop: 11,
                    borderTop: "1px solid rgba(21,24,30,.08)",
                    font: `500 13.5px/1.55 ${MR}`,
                    color: "var(--metallic)",
                    animation: "swapIn .28s ease",
                  }}
                >
                  {c.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* KILLER FEATURES */}
      <div style={{ padding: "26px 22px 4px" }}>
        <div style={{ ...eyebrow, marginBottom: 14 }}>что умеет сервис</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "0 16px" }}>
        {[
          { g: "◉", label: "Оценка по фото", meta: "≈ 5 мин", kind: "lead" as const },
          { g: "▦", label: "Калькулятор по схеме кузова", meta: "", kind: "calc" as const },
          { g: "◷", label: "Трекинг статуса ремонта", meta: "", kind: "track" as const },
          { g: "◈", label: "Подбор кода краски по VIN", meta: "", kind: "none" as const },
          { g: "▧", label: "QR-сертификат гарантии", meta: "", kind: "none" as const },
        ].map((f) => {
          const clickable = f.kind !== "none";
          const inner = (
            <>
              <span
                style={{
                  width: 38,
                  height: 38,
                  flex: "none",
                  borderRadius: 11,
                  background: "var(--electric-tint)",
                  color: "var(--electric-deep)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: `400 19px ${MR}`,
                }}
              >
                {f.g}
              </span>
              <span style={{ font: `700 14.5px ${MR}`, flex: 1 }}>{f.label}</span>
              {f.meta && <span style={{ font: `800 13px ${MR}`, color: "var(--metallic)" }}>{f.meta}</span>}
              {clickable && <span style={{ font: `400 18px ${MR}`, color: "var(--electric)" }}>→</span>}
            </>
          );
          const rowStyle: React.CSSProperties = {
            display: "flex",
            alignItems: "center",
            gap: 13,
            background: "#fff",
            borderRadius: 14,
            padding: "12px 15px",
            boxShadow: "0 6px 18px -14px rgba(21,24,30,.16)",
            cursor: clickable ? "pointer" : "default",
            textDecoration: "none",
            color: "var(--graphite)",
          };
          if (f.kind === "calc")
            return (
              <Link key={f.label} href="/calculator" style={rowStyle}>
                {inner}
              </Link>
            );
          if (f.kind === "track")
            return (
              <Link key={f.label} href="/tracking" style={rowStyle}>
                {inner}
              </Link>
            );
          if (f.kind === "lead")
            return (
              <div key={f.label} onClick={() => openLead("Оценка по фото")} style={rowStyle}>
                {inner}
              </div>
            );
          return (
            <div key={f.label} style={rowStyle}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* BEFORE / AFTER slider */}
      <div style={{ padding: "40px 22px 4px" }}>
        <div style={{ ...eyebrow, marginBottom: 12 }}>до / после</div>
        <h2 style={{ margin: 0, font: `800 28px/1.08 ${UB}`, letterSpacing: "-.02em" }}>
          смотри, что было
          <br />
          и что стало
        </h2>
        <p style={{ margin: "12px 0 0", font: `500 14.5px/1.55 ${MR}`, color: "var(--text-muted)" }}>
          Потяни ползунок — каждая работа это результат, который видно.
        </p>
      </div>
      <div style={{ padding: "20px 16px 0" }}>
        <div
          ref={baRef}
          onPointerDown={(e) => {
            dragging.current = true;
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {}
            setBaFromX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (dragging.current) setBaFromX(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          style={{
            position: "relative",
            height: 260,
            borderRadius: 20,
            overflow: "hidden",
            touchAction: "none",
            cursor: "ew-resize",
            userSelect: "none",
          }}
        >
          <div className="plc" style={{ position: "absolute", inset: 0, backgroundColor: "#d8dbe0", color: "var(--metallic)" }}>
            после · ЛКП восстановлено
          </div>
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - ba}% 0 0)` }}>
            <div
              className="plc"
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#3a3f47",
                color: "#c2c6cd",
                backgroundImage:
                  "repeating-linear-gradient(45deg,rgba(0,0,0,.22) 0 10px,rgba(0,0,0,.1) 10px 20px)",
              }}
            >
              до · вмятина и скол
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(21,24,30,.72)",
              color: "#fff",
              font: `700 11px ${MR}`,
              padding: "4px 10px",
              borderRadius: 20,
            }}
          >
            до
          </div>
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "var(--electric)",
              color: "var(--electric-ink)",
              font: `700 11px ${MR}`,
              padding: "4px 10px",
              borderRadius: 20,
            }}
          >
            после
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${ba}%`,
              width: 3,
              background: "var(--electric)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "translateX(-1.5px)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--electric)",
                color: "var(--electric-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: `800 18px ${MR}`,
                boxShadow: "0 4px 14px rgba(0,0,0,.3)",
              }}
            >
              ‹›
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS + counter */}
      <div style={{ padding: "40px 22px 4px" }}>
        <div style={{ ...eyebrow, marginBottom: 12 }}>отзывы</div>
        <h2 style={{ margin: 0, font: `800 27px/1.1 ${UB}`, letterSpacing: "-.02em" }}>
          нам доверяют авто
          <br />в Уральске
        </h2>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "20px 22px 4px" }}>
        <div style={{ font: `800 46px ${UB}`, letterSpacing: "-.03em", color: "var(--electric)" }}>
          {site.restoredCount}
        </div>
        <div style={{ font: `600 13.5px/1.4 ${MR}`, color: "var(--text-muted)" }}>
          авто уже
          <br />
          восстановлено
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, padding: "14px 16px 0" }}>
        {reviews.map((r) => (
          <div
            key={r.name}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 17,
              boxShadow: "0 8px 24px -14px rgba(21,24,30,.16)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <div style={{ font: `800 15px ${MR}` }}>{r.name}</div>
              <div
                style={{
                  font: `700 11px ${MR}`,
                  color: "var(--metallic)",
                  background: "rgba(21,24,30,.05)",
                  padding: "4px 9px",
                  borderRadius: 20,
                }}
              >
                {r.src}
              </div>
            </div>
            <div style={{ color: "var(--graphite)", fontSize: 14, letterSpacing: 2, marginBottom: 9 }}>
              ★★★★★
            </div>
            <p style={{ margin: 0, font: `500 14px/1.55 ${MR}`, color: "var(--text-muted)" }}>{r.text}</p>
          </div>
        ))}
      </div>

      {/* FINAL CTA */}
      <div style={{ margin: "38px 16px 0", background: "var(--graphite)", borderRadius: 24, padding: "28px 24px" }}>
        <h2 style={{ margin: 0, font: `800 26px/1.12 ${UB}`, color: "#fff", letterSpacing: "-.02em" }}>
          не откладывай — скол и царапина только растут
        </h2>
        <p style={{ margin: "14px 0 20px", font: `500 14px/1.5 ${MR}`, color: "var(--text-on-dark)" }}>
          Пришли фото прямо сейчас и узнай стоимость ремонта за 5 минут.
        </p>
        <button
          onClick={() => openLead("Оценка по фото")}
          style={{
            width: "100%",
            height: 56,
            border: 0,
            borderRadius: 15,
            background: "var(--electric)",
            color: "var(--electric-ink)",
            font: `800 16px ${MR}`,
            cursor: "pointer",
          }}
        >
          Рассчитать по фото
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,.1)",
            font: `600 13px ${MR}`,
            color: "var(--metallic)",
          }}
        >
          <div>WhatsApp · {site.phoneDisplay}</div>
          <div>{site.address}</div>
          <div>{site.hours}</div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "28px 22px 120px", textAlign: "center" }}>
        <div style={{ font: `800 24px ${UB}` }}>
          RE<span style={{ color: "var(--electric)" }}>:</span>CAR
        </div>
        <div style={{ marginTop: 8, font: `600 12px ${MR}`, color: "var(--metallic)" }}>
          твоё авто — как новое · {site.city}, {site.region}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link href="/privacy" style={{ font: `600 12px ${MR}`, color: "var(--metallic)" }}>
            политика конфиденциальности
          </Link>
        </div>
      </div>

      {/* FLOATING WHATSAPP */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          right: 18,
          bottom: 22,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "var(--electric)",
          color: "var(--electric-ink)",
          borderRadius: 30,
          padding: "14px 20px",
          font: `800 14.5px ${MR}`,
          boxShadow: "0 10px 30px -8px rgba(23,227,194,.6)",
          textDecoration: "none",
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--electric-ink)", display: "inline-block" }} />
        Написать в WhatsApp
      </a>

      {/* BOTTOM SHEET — заявка */}
      {lead && (
        <div
          onClick={() => setLead(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(21,24,30,.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            animation: "fadeIn .2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 430,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--bg-soft)",
              borderRadius: "26px 26px 0 0",
              animation: "slideUp .3s cubic-bezier(.2,.9,.3,1)",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 20px 12px",
                background: "var(--bg-soft)",
              }}
            >
              <div style={{ font: `800 18px ${UB}`, letterSpacing: "-.01em" }}>{lead.title}</div>
              <div
                onClick={() => setLead(null)}
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
            <LeadForm
              serviceType={lead.serviceType}
              intro={lead.intro}
              title={lead.title}
              onClose={() => setLead(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
