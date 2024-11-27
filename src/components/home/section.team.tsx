import Image from "next/image";

export default function SectionTeam() {
  return (
    <main className="w-full flex items-center justify-center bg-[#F9F7C9] xl:py-[120px] py-[30px]">
      <div className="w-full flex flex-col max-w-[1440px] items-center xl:space-y-[80px] space-y-[30px]">
        {/* Project By */}
        <div className="flex flex-col items-center xl:space-y-[40px] space-y-[20px]">
          <span className="text-[#FB7A04] xl:text-[30px] text-[18px] font-[600] h-[45px]">
            Project By
          </span>
          <div className="relative xl:w-[168px] w-[84px] xl:h-[60px] h-[30px]">
            <Image
              src="/home/logo_umirae3.png"
              layout="fill"
              objectFit="contain"
              alt="Umirae logo"
              quality={100}
            />
          </div>
        </div>

        {/* Funded By */}
        <div className="flex flex-col items-center xl:space-y-[40px] space-y-[20px]">
          <span className="text-[#FB7A04] xl:text-[30px] text-[18px] font-[600] h-[45px]">
            Funded By
          </span>
          <div className="relative xl:w-[72px] xl:h-[40px] w-[36px] h-[20px]">
            <Image
              src="/home/logo_avpn.png"
              layout="fill"
              objectFit="contain"
              alt="AVPN logo"
              quality={100}
            />
          </div>
        </div>

        {/* Partners */}
        <div className="flex flex-col items-center xl:space-y-[40px] space-y-[20px]">
          <span className="text-[#FB7A04] xl:text-[30px] text-[18px] font-[600] h-[45px]">
            Partners
          </span>
          <div className="flex xl:flex-row flex-col xl:space-x-[96px] xl:space-y-[0px] space-y-[30px] items-center">
            {/* 코어다트랩 */}
            <div className="relative xl:w-[212px] w-[106px] xl:h-[30px] h-[15px]">
              <Image
                src="/logo_coredotlab.png"
                layout="fill"
                objectFit="contain"
                alt="Partner logo"
                quality={100}
              />
            </div>
            {/* 식스티헤르츠 */}
            <div className="relative xl:w-[151px] xl:h-[40px] w-[75px] h-[20px]">
              <Image
                src="/home/logo_60.png"
                layout="fill"
                objectFit="contain"
                alt="Partner logo"
                quality={100}
              />
            </div>
          </div>
        </div>

        {/* Institutions */}
        <div className="flex flex-col items-center xl:space-y-[40px] space-y-[20px]">
          <span className="text-[#FB7A04] xl:text-[30px] text-[18px] font-[600] h-[45px]">
            Institutions
          </span>
          <div className="flex xl:flex-row flex-col xl:space-x-[96px] xl:space-y-[0px] space-y-[30px] items-center">
            {/* google org */}
            <div className="relative xl:w-[188px] xl:h-[40px] w-[94px] h-[20px]">
              <Image
                src="/home/logo_google.png"
                layout="fill"
                objectFit="contain"
                alt="Institution logo"
                quality={100}
              />
            </div>
            {/* adb */}
            <div className="relative xl:w-[62px] xl:h-[40px] w-[31px] h-[20px]">
              <Image
                src="/home/logo_adb.png"
                layout="fill"
                objectFit="contain"
                alt="Institution logo"
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
