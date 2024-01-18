import Image from "next/image";

export default function SectionTeam() {
  return (
    <main className="w-full flex items-center justify-center bg-[#F9F7C9] xl:py-[120px] py-[30px]">
      <div className="w-full flex flex-col  max-w-[1440px] items-center xl:space-y-[80px] space-y-[30px]">
        {/* partners */}
        <div className="flex flex-col items-center xl:space-y-[40px] space-y-[20px]">
          <span className="text-[#FB7A04] xl:text-[30px] text-[18px] font-[600] h-[45px]">
            Partners
          </span>
          <div className="flex xl:flex-row flex-col xl:space-x-[96px] xl:space-y-[0px] space-y-[30px] items-center">
            {/* 우미래 */}
            <div className="relative w-[168px] h-[60px]">
              <Image
                src="/home/logo_umirae.png"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </div>
            {/* 코어다트랩 */}
            <div className="relative w-[212px] h-[30px]">
              <Image
                src="/logo_coredotlab.png"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </div>
            {/* 식스티헤르츠 */}
            <div className="relative w-[151px] h-[40px]">
              <Image
                src="/home/logo_60.png"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </div>
          </div>
        </div>

        {/* institutions */}
        <div className="flex flex-col items-center xl:space-y-[40px] space-y-[20px]">
          <span className="text-[#FB7A04] xl:text-[30px] text-[18px] font-[600] h-[45px]">
            Institutions
          </span>
          <div className="flex xl:flex-row flex-col xl:space-x-[96px] xl:space-y-[0px] space-y-[30px] items-center">
            {/* avpn */}
            <div className="relative w-[72px] h-[40px]">
              <Image
                src="/home/logo_avpn.png"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </div>
            {/* google org */}
            <div className="relative w-[188px] h-[40px]">
              <Image
                src="/home/logo_google.png"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </div>
            {/* adb */}
            <div className="relative w-[62px] h-[40px]">
              <Image
                src="/home/logo_adb.png"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
