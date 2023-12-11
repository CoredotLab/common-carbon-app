import Image from "next/image";
import { useTranslations } from "next-intl";
import Title from "./components/title";
import Filter from "./components/filter";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="flex flex-col min-w-[360px] max-w-[1440px] w-full py-[10px] px-[20px] items-center space-y-[10px]">
      <Title />
      <Filter />
    </main>
  );
}
