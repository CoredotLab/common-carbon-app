import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="relative flex flex-col items-center justify-between font-pretendard w-full">
      <div className="absolute relative w-screen h-[616px] shrink-0">
        <Image
          src="/bussiness_sample.jpeg"
          alt="sample"
          fill
          quality={100}
          objectFit="cover"
        />
        <div className="absolute flex flex-col justify-center items-center w-full h-full space-y-[30px]">
          <span className="text-white lg:text-[60px] text-[40px] font-[700] text-center drop-shadow-2xl">
            Reviving Our World
            <br />
            Through Innovation
          </span>
          <span className="text-white lg:text-[40px] text-[20px] font-[700] text-center drop-shadow-2xl">
            Empowering Change, One Byte at a Time.
            <br className="md:flex hidden" /> Pioneering Carbon Solutions for a
            Sustainable Future.
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center py-[50px] space-y-[50px]">
        <div className="relative w-[310px] h-[120px]">
          <Image src="/logo_umirae.png" alt="logo_umirae" fill quality={100} />
        </div>
        <div className="relative w-[310px] h-[50px]">
          <Image
            src="/logo_coredotlab.png"
            alt="logo_coredotlab"
            fill
            quality={100}
          />
        </div>
      </div>
    </main>
  );
}
