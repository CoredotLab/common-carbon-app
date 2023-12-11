import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="flex flex-col items-center justify-between font-pretendard">
      <Image
        src="/home/sample.jpg"
        alt="sample"
        width={2820}
        height={4222}
        quality={100}
      />
    </main>
  );
}
