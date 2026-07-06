import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — RE:CAR",
};

const UB = "var(--font-unbounded)";
const MR = "var(--font-manrope)";

export default function PrivacyPage() {
  const h2: React.CSSProperties = {
    font: `800 19px/1.2 ${UB}`,
    letterSpacing: "-.01em",
    margin: "28px 0 10px",
  };
  const p: React.CSSProperties = {
    font: `500 14.5px/1.6 ${MR}`,
    color: "var(--text-muted)",
    margin: "0 0 10px",
  };

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

      <div style={{ padding: "24px 22px 60px" }}>
        <h1 style={{ font: `800 26px/1.15 ${UB}`, letterSpacing: "-.02em", margin: "0 0 6px" }}>
          политика конфиденциальности
        </h1>
        <p style={{ ...p, color: "var(--metallic)", fontSize: 12.5 }}>
          Черновик-шаблон. Перед публикацией проверь у юриста и подставь реальные данные компании.
        </p>

        <h2 style={h2}>1. Кто обрабатывает данные</h2>
        <p style={p}>
          Автосервис {site.brand} ({site.city}, {site.region}). По вопросам обработки персональных
          данных: {site.privacyEmail}.
        </p>

        <h2 style={h2}>2. Какие данные мы собираем</h2>
        <p style={p}>
          Когда ты оставляешь заявку или записываешься через сайт, мы собираем: имя, номер телефона,
          данные об автомобиле (марка, модель), фотографии повреждений (если прикрепляешь) и описание
          проблемы. Технические данные (например, факт отправки формы) — в минимальном объёме.
        </p>

        <h2 style={h2}>3. Зачем</h2>
        <p style={p}>
          Данные нужны только чтобы связаться с тобой, рассчитать стоимость ремонта, согласовать запись
          и оказать услугу. Мы не используем их для рассылок без твоего отдельного согласия.
        </p>

        <h2 style={h2}>4. Основание — твоё согласие</h2>
        <p style={p}>
          Обработка выполняется на основании согласия, которое ты даёшь, отмечая чекбокс при отправке
          формы. Согласие можно отозвать — напиши нам, и мы удалим данные.
        </p>

        <h2 style={h2}>5. Хранение и защита</h2>
        <p style={p}>
          Данные хранятся в защищённой базе (Supabase) с ограничением доступа. Мы храним их не дольше,
          чем нужно для обработки заявки и выполнения работ, и не передаём третьим лицам, кроме случаев,
          предусмотренных законом Республики Казахстан «О персональных данных и их защите».
        </p>

        <h2 style={h2}>6. Твои права</h2>
        <p style={p}>
          Ты можешь запросить, какие данные о тебе есть, попросить их исправить или удалить, а также
          отозвать согласие. Для этого напиши нам: {site.privacyEmail}.
        </p>

        <h2 style={h2}>7. Изменения</h2>
        <p style={p}>
          Мы можем обновлять эту политику. Актуальная версия всегда доступна на этой странице.
        </p>

        <div style={{ marginTop: 30 }}>
          <Link href="/" style={{ font: `700 14px ${MR}`, color: "var(--electric-deep)" }}>
            ← вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
