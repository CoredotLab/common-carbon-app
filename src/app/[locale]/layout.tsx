import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SideMenu from "@/components/sidemenu";

const pretendard = localFont({
  src: "../../PretendardVariable.ttf",
  display: "swap",
  variable: "--font-pretendard",
});

const suit = localFont({
  src: "../../SuitVariable.ttf",
  display: "swap",
  variable: "--font-suit",
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
      <body className={pretendard.variable + " " + suit.variable}>
        <div className="relative min-h-screen flex flex-col items-center font-pretendard">
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <SideMenu />
        </div>
      </body>
    </html>
  );
}
