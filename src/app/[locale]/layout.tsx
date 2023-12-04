import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import Header from "@/components/header";
import Footer from "@/components/footer";

const pretendard = localFont({
  src: "../../PretendardVariable.ttf",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "Common Carbon",
  description: "Common Carbon Project",
};

const locales = ["en", "ko"];

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    return notFound();
  }

  return (
    <html lang={locale}>
      <body className={pretendard.variable}>
        <div className="min-h-screen flex flex-col items-center">
          <Header />
          <main className="flex-1 mt-[70px] max-w-[1440px] min-w-[360px]">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
