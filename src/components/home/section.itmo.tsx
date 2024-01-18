"use client";

import Image from "next/image";

export default function SectionItmo() {
  return (
    <main className="w-full bg-[#15244F] flex justify-center">
      <div className="w-full max-w-[1440px] flex xl:py-[80px] py-[30px] flex-col space-y-[41px] items-center">
        <div className="flex flex-col space-y-[27px] xl:px-[80px] px-[20px] xl:max-w-[1440px] max-w-[600px]">
          <span className="text-[#B7DAFF] xl:text-[30px] text-[20px] font-[600]">
            What is ITMO?
          </span>
          <div className="flex xl:flex-row flex-col xl:space-x-[40px] xl:space-y-[0px] space-y-[40px] items-center">
            <span className="text-white xl:text-[20px] text-[14px] font-[300]">
              ITMO stands for &quot;Internationally Transferred Mitigation
              Outcomes.&quot; It&apos;s a concept used within the framework of
              international climate change agreements, particularly under the
              United Nations Framework Convention on Climate Change (UNFCCC) and
              the Paris Agreement.
            </span>
            <button
              className="w-[240px] h-[36px] bg-[#157593] text-white p-[10px] flex items-center justify-center text-[14px] font-[600] flex-shrink-0"
              onClick={() => alert("Service will be available soon!")}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="relative xl:flex hidden w-[1020px] h-[546px]">
          <Image
            src="/home/itmo_pc.png"
            layout="fill"
            objectFit="contain"
            alt="itmo image"
          />
        </div>
        <div className="relative xl:hidden w-[300px] h-[530px]">
          <Image
            src="/home/itmo_mobile.png"
            layout="fill"
            objectFit="contain"
            alt="itmo image"
          />
        </div>
      </div>
    </main>
  );
}
