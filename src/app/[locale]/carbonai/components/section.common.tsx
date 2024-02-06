"use client";

import Image from "next/image";

export default function SectionCommon() {
  return (
    <main className="w-full bg-[#2C2C2C] flex justify-center">
      <div className="w-full max-w-[1440px] flex xl:py-[80px] py-[30px] flex-col space-y-[41px] items-center">
        <div className="w-full flex flex-col items-center justify-center space-y-[21px] max-w-[1280px] px-4">
          <div
            className="
            relative w-[1440px] h-[1422px] xl:flex hidden
            "
          >
            <Image
              src="/carbonai/diagram_common_pc.png"
              layout="fill"
              objectFit="contain"
              alt="carbon credit market"
              quality={100}
            />
          </div>
          <div
            className="
            relative w-[340px] h-[1281px] xl:hidden flex
            "
          >
            <Image
              src="/carbonai/diagram_common_mobile.png"
              layout="fill"
              objectFit="contain"
              alt="carbon credit market"
              quality={100}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
