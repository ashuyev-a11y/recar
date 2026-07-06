import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Калькулятор ремонта — RE:CAR",
};

export default function CalculatorPage() {
  return (
    <ComingSoon
      eyebrow="калькулятор по схеме кузова"
      title="посчитаем ремонт по деталям"
      text="Здесь будет интерактивная схема кузова: отмечаешь повреждённые детали и сразу видишь предварительную сумму. Пока — оставь заявку на главной, и мастер рассчитает по фото."
    />
  );
}
