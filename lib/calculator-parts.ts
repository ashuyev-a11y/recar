import type { Category, Operation } from "@/lib/calculator-pricing";

/**
 * Геометрия схемы кузова (вид сверху). Это РАСКЛАДКА, а не цены —
 * цены лежат отдельно в lib/calculator-pricing.ts.
 *
 * Базовый холст схемы — 240×340 (как в макете). Координаты деталей и
 * декора заданы в этих координатах; масштаб схемы задаётся в CSS.
 */

export type Part = {
  id: string;
  label: string; // короткая подпись на детали
  full: string; // полное название в списке/пикере
  cat: Category;
  pos: { top: number; left: number; width: number; height: number; radius?: string };
};

/** Силуэт кузова — clip-path контейнера схемы (сужается к носу и корме). */
export const bodyClipPath =
  "polygon(20% 0,80% 0,93% 5%,100% 15%,100% 85%,93% 95%,80% 100%,20% 100%,7% 95%,0 85%,0 15%,7% 5%)";

/** Кликабельные детали (13 шт). */
export const parts: Part[] = [
  { id: "fbmp", label: "бампер", full: "Передний бампер", cat: "bumper", pos: { top: 0, left: 40, width: 160, height: 24, radius: "18px 18px 5px 5px" } },
  { id: "hood", label: "капот", full: "Капот", cat: "hood", pos: { top: 30, left: 58, width: 124, height: 34, radius: "6px 6px 10px 10px" } },
  { id: "flf", label: "крыло", full: "Левое переднее крыло", cat: "fender", pos: { top: 30, left: 6, width: 46, height: 76 } },
  { id: "frf", label: "крыло", full: "Правое переднее крыло", cat: "fender", pos: { top: 30, left: 188, width: 46, height: 76 } },
  { id: "fld", label: "дверь", full: "Левая передняя дверь", cat: "door", pos: { top: 110, left: 6, width: 46, height: 60 } },
  { id: "rld", label: "дверь", full: "Левая задняя дверь", cat: "door", pos: { top: 174, left: 6, width: 46, height: 62 } },
  { id: "frd", label: "дверь", full: "Правая передняя дверь", cat: "door", pos: { top: 110, left: 188, width: 46, height: 60 } },
  { id: "rrd", label: "дверь", full: "Правая задняя дверь", cat: "door", pos: { top: 174, left: 188, width: 46, height: 62 } },
  { id: "roof", label: "крыша", full: "Крыша", cat: "roof", pos: { top: 100, left: 62, width: 116, height: 74 } },
  { id: "trunk", label: "багажник", full: "Крышка багажника", cat: "trunk", pos: { top: 214, left: 58, width: 124, height: 50, radius: "10px 10px 6px 6px" } },
  { id: "rlf", label: "крыло", full: "Левое заднее крыло", cat: "fender", pos: { top: 240, left: 6, width: 46, height: 76 } },
  { id: "rrf", label: "крыло", full: "Правое заднее крыло", cat: "fender", pos: { top: 240, left: 188, width: 46, height: 76 } },
  { id: "rbmp", label: "бампер", full: "Задний бампер", cat: "bumper", pos: { top: 316, left: 40, width: 160, height: 24, radius: "5px 5px 18px 18px" } },
];

export const partById = (id: string): Part | undefined => parts.find((p) => p.id === id);

/** Декоративные (некликабельные) элементы: стёкла, зеркала, колёса, фары. */
export const decor: React.CSSProperties[] = [
  // лобовое стекло
  { top: 66, left: 62, width: 116, height: 32, background: "#aeb7c2", borderRadius: "9px 9px 4px 4px", clipPath: "polygon(15% 0,85% 0,100% 100%,0 100%)" },
  // заднее стекло
  { top: 176, left: 62, width: 116, height: 32, background: "#aeb7c2", borderRadius: "4px 4px 9px 9px", clipPath: "polygon(0 0,100% 0,85% 100%,15% 100%)" },
  // зеркала
  { top: 94, left: -3, width: 16, height: 9, background: "#c4cad2", borderRadius: 5 },
  { top: 94, left: 227, width: 16, height: 9, background: "#c4cad2", borderRadius: 5 },
  // колёса
  { top: 46, left: -5, width: 11, height: 36, background: "#2a2f37", borderRadius: 5 },
  { top: 46, left: 234, width: 11, height: 36, background: "#2a2f37", borderRadius: 5 },
  { top: 258, left: -5, width: 11, height: 36, background: "#2a2f37", borderRadius: 5 },
  { top: 258, left: 234, width: 11, height: 36, background: "#2a2f37", borderRadius: 5 },
  // фары
  { top: 4, left: 46, width: 28, height: 11, background: "#eef2f6", borderRadius: 6 },
  { top: 4, left: 166, width: 28, height: 11, background: "#eef2f6", borderRadius: 6 },
].map((d) => ({ position: "absolute", pointerEvents: "none", ...d }));

/** Пресеты частых случаев — разом заполняют схему набором «деталь → операция». */
export const presets: { label: string; sel: Record<string, Operation> }[] = [
  { label: "Поцарапал бок", sel: { fld: "paint", rld: "paint", flf: "paint" } },
  { label: "Удар в зад", sel: { rbmp: "replace", trunk: "repair", rlf: "repair", rrf: "repair" } },
  { label: "Помял перёд", sel: { fbmp: "replace", hood: "repair", flf: "repair" } },
];
