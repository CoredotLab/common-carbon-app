"use client";

import Image from "next/image";

export default function SectionItmo() {
  return (
    <main className="w-full bg-[#15244F] flex justify-center">
      <div className="w-full max-w-[1440px] flex xl:py-[80px] py-[30px] flex-col space-y-[41px] items-center">
        <div className="w-full flex flex-col items-center justify-center space-y-[21px] max-w-[1280px] px-4">
          <span className="font-[600] xl:text-[30px] text-[20px] text-[#B7DAFF] w-full">
            What is ITMO
          </span>
          <span
            className="
                font-[500] xl:text-[20px] text-[14px] text-[#fff] mt-[20px]
            "
          >
            Article 6 facilitates international cooperation for enhancing
            Nationally Determined Contributions (NDCs) and achieving global
            sustainable development goals. It introduces Internationally
            Transferred Mitigation Outcomes (ITMOs) for exchanging emissions
            reductions between countries. ITMOs, unlike traditional credits, are
            not tied to specific projects, offering flexibility in the carbon
            market.
          </span>

          <div
            className="
            relative w-[1020px] h-[546px] xl:flex hidden
            "
          >
            <Image
              src="/home/itmo_pc.png"
              layout="fill"
              objectFit="contain"
              alt="carbon credit market"
              quality={100}
            />
          </div>
          <div
            className="
            relative w-[300px] h-[534px] xl:hidden flex
            "
          >
            <Image
              src="/home/itmo_mobile2.png"
              layout="fill"
              objectFit="contain"
              alt="carbon credit market"
              quality={100}
            />
          </div>
          <span
            className="
                font-[500] xl:text-[20px] text-[14px] text-[#fff] mt-[20px]
            "
          >
            Host countries benefit from ITMO transactions by attracting
            investments into low-carbon projects, supporting sustainable
            development. Acquiring countries can enhance their NDC ambitions by
            financing cost-effective projects through ITMOs transactions. <br />
            <br />
            To prevent double-counting, the Article 6 Rulebook establishes an
            accounting framework, requiring corresponding adjustments during
            ITMO transfers. Host countries deduct transferred emissions from
            their inventory, and the acquiring country applies adjustments when
            counting ITMOs toward its NDC. In this process, new technologies
            like artificial intelligence can enhance transparency and efficiency
            in ITMO transactions.
          </span>
        </div>
      </div>
    </main>
  );
}
