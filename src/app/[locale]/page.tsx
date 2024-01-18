import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionMain from "@/components/home/section.main";
import SectionImpacts from "@/components/home/section.impacts";
import SectionValues from "@/components/home/section.values";
import SectionProjects from "@/components/home/section.projects";
import SectionItmo from "@/components/home/section.itmo";
import SectionTeam from "@/components/home/section.team";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="relative w-full min-w-[320px] flex flex-col items-center">
      <SectionMain />
      <SectionImpacts />
      <SectionValues />
      <SectionProjects />
      <SectionItmo />
      <SectionTeam />
    </main>
  );
}
