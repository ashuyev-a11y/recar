import Link from "next/link";

const UB = "var(--font-unbounded)";
const MR = "var(--font-manrope)";

/**
 * Заглушка для будущих фич (каркас есть — логику добавим отдельным шагом).
 */
export default function ComingSoon({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "var(--bg-soft)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid rgba(21,24,30,.06)",
        }}
      >
        <Link href="/" style={{ font: `700 20px ${MR}`, color: "var(--graphite)", textDecoration: "none" }}>
          ←
        </Link>
        <div style={{ font: `800 18px ${UB}`, letterSpacing: "-.01em" }}>
          RE<span style={{ color: "var(--electric)" }}>:</span>CAR
        </div>
      </div>

      <div style={{ padding: "60px 22px", textAlign: "center" }}>
        <div style={{ ...eyebrowStyle }}>{eyebrow}</div>
        <span
          style={{
            display: "inline-block",
            margin: "14px 0 18px",
            background: "var(--amber)",
            color: "#fff",
            font: `800 10px ${MR}`,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            padding: "5px 11px",
            borderRadius: 20,
          }}
        >
          скоро
        </span>
        <h1 style={{ font: `800 30px/1.12 ${UB}`, letterSpacing: "-.02em", margin: "0 0 14px" }}>
          {title}
        </h1>
        <p
          style={{
            font: `500 15px/1.6 ${MR}`,
            color: "var(--text-muted)",
            maxWidth: 320,
            margin: "0 auto 28px",
          }}
        >
          {text}
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            height: 52,
            lineHeight: "52px",
            padding: "0 26px",
            borderRadius: 15,
            background: "var(--graphite)",
            color: "#fff",
            font: `800 15px ${MR}`,
            textDecoration: "none",
          }}
        >
          на главную
        </Link>
      </div>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = {
  font: `700 11px ${MR}`,
  letterSpacing: ".14em",
  color: "var(--metallic)",
  textTransform: "uppercase",
};
