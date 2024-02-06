import Image from "next/image";
import { useTranslations } from "next-intl";
import AOSProvider from "@/app/aosProvider";
import SectionMain from "./components/section.main";
import SectionCarbonCredit from "./components/section.carbon";
import SectionSummary from "@/components/home/section.summary";
import SectionItmo from "./components/section.itmo";
import SectionAI from "./components/section.ai";
import SectionCommon from "./components/section.common";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="relative w-full min-w-[320px] flex flex-col items-center">
      <AOSProvider>
        <SectionMain />
        <SectionCarbonCredit />
        <SectionItmo />
        <SectionAI />
        <SectionCommon />
        <SectionSummary />
      </AOSProvider>
    </main>
  );
}
