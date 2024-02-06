"use client";

import Image from "next/image";

export default function SectionCarbonCredit() {
  return (
    <main className="w-full bg-[#2C2C2C] flex justify-center">
      <div className="w-full max-w-[1440px] flex xl:py-[80px] py-[30px] flex-col space-y-[41px] items-center">
        <div className="w-full flex xl:flex-row flex-col items-center justify-center xl:space-x-[160px] xl:space-y-[0px] space-y-[20px]">
          <div className="flex flex-col xl:max-w-[416px] max-w-[300px]">
            <span className="font-[600] xl:text-[30px] text-[20px] text-[#83A42C]">
              Carbon credit Market
            </span>
            <span
              className="
                font-[500] xl:text-[20px] text-[14px] text-[#fff] mt-[20px]
            "
            >
              Carbon markets could leverage up to US$--bn per year in climate
              investments. Carbon market size is expanding as the spectrum of
              compliance—voluntary, domestic, and international—adds complexity
              to the markets. <br />
              <br />
              Carbon prices are determined by market, based on various drivers
              and credit attributes. Specially Carbon credits generated via
              national and corporate carbon reduction and removal initiatives
              through ITMO mechanism are now adding new market value to achieve
              its NDCs and emission reduction target.
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div
              className="
            relative xl:w-[664px] xl:h-[580px] w-[300px] h-[260px]
            "
            >
              <Image
                src="/carbonai/diagram_market.png"
                layout="fill"
                objectFit="contain"
                alt="carbon credit market"
                quality={100}
              />
            </div>
            <span className="text-white font-[300] xl:text-[14px] text-[12px]">
              World Bank (2023), Primer on Article 6 markets
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
