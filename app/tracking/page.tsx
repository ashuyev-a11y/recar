import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Статус ремонта — RE:CAR",
};

export default function TrackingPage() {
  return (
    <ComingSoon
      eyebrow="трекинг статуса ремонта"
      title="следи за ремонтом онлайн"
      text="Здесь по номеру заказа можно будет посмотреть, на каком этапе твоя машина, с фото и видео с каждого шага. Готовим этот раздел — включим отдельным шагом."
    />
  );
}
