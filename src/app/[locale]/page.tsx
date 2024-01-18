import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionMain from "@/components/home/section.main";
import SectionImpacts from "@/components/home/section.impacts";
import SectionValues from "@/components/home/section.values";
import SectionProjects from "@/components/home/section.projects";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="relative w-full min-w-[320px] flex flex-col items-center">
      <SectionMain />
      <SectionImpacts />
      <SectionValues />
      <SectionProjects />
    </main>
  );
}
