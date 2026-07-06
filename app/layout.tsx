import type { Metadata } from "next";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";

// Заголовки — Unbounded; текст/UI — Manrope. Обе с кириллицей.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RE:CAR — кузовной ремонт, покраска, детейлинг в Уральске",
  description:
    "Автосервис полного цикла в Уральске: кузовной ремонт, покраска, детейлинг, химчистка. Пришли фото — узнаешь цену за 5 минут.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
