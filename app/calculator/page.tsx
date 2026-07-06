import type { Metadata } from "next";
import CalculatorClient from "@/components/CalculatorClient";

export const metadata: Metadata = {
  title: "Калькулятор кузовного ремонта — RE:CAR",
  description:
    "Собери свой ремонт: отмечай детали кузова, выбирай операцию и сразу видь предварительную сумму. Точную цену назовём после осмотра.",
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
