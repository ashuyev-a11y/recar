/**
 * ЗАГЛУШКА-ПРАЙС калькулятора кузовного ремонта.
 * ------------------------------------------------------------------
 * ВСЕ ЧИСЛА ЗДЕСЬ — ВРЕМЕННЫЕ (условные). Замени их на реальные
 * в ЭТОМ файле — логика калькулятора менять не нужно.
 *
 * Цена считается так:  базовая цена детали × коэффициент класса авто,
 * с округлением до 500 ₸ (см. adjustPrice ниже).
 * ------------------------------------------------------------------
 */

export type Operation = "repair" | "paint" | "replace";
export type Category = "bumper" | "hood" | "trunk" | "fender" | "door" | "roof";

/** Подписи операций (в фирменном sentence case). */
export const workLabels: Record<Operation, string> = {
  repair: "ремонт",
  paint: "покраска",
  replace: "замена",
};

/**
 * Базовые цены (₸) по КАТЕГОРИИ детали и операции. Заглушка!
 * Категория, а не каждая деталь: 4 двери стоят одинаково, 4 крыла одинаково.
 * Хочешь разные цены по конкретным деталям — скажи, переделаем на прайс по id.
 */
export const priceMap: Record<Category, Record<Operation, number>> = {
  bumper: { repair: 20000, paint: 18000, replace: 55000 }, // бампер
  hood: { repair: 35000, paint: 32000, replace: 120000 }, // капот
  trunk: { repair: 32000, paint: 28000, replace: 95000 }, // крышка багажника
  fender: { repair: 26000, paint: 22000, replace: 70000 }, // крыло
  door: { repair: 30000, paint: 26000, replace: 95000 }, // дверь
  roof: { repair: 40000, paint: 38000, replace: 150000 }, // крыша
};

/**
 * Классы авто и коэффициент к базовой цене. Заглушка — правь при желании.
 */
export const carClasses: { label: string; coef: number }[] = [
  { label: "Седан", coef: 1.0 },
  { label: "Кроссовер", coef: 1.2 },
  { label: "Внедорожник", coef: 1.4 },
];

/** Базовая цена × коэффициент класса, округление до 500 ₸. */
export function adjustPrice(base: number, coef: number): number {
  return Math.round((base * coef) / 500) * 500;
}

/** Формат суммы: 20000 -> "20 000 ₸". */
export function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₸";
}
