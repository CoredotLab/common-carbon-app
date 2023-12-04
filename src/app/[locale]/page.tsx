import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="flex flex-col items-center justify-between font-pretendard">
      {t("title")}
    </main>
  );
}
