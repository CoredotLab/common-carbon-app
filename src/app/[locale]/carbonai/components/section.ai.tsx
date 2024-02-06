"use client";

import Image from "next/image";

export default function SectionAI() {
  return (
    <main className="w-full bg-[#092000] flex justify-center">
      <div className="w-full max-w-[1440px] flex xl:py-[80px] py-[30px] flex-col space-y-[41px] items-center">
        <div className="w-full flex flex-col items-center justify-center space-y-[21px] max-w-[1280px] px-4">
          <span className="font-[600] xl:text-[30px] text-[20px] text-[#13AA8E] w-full">
            AI can support ITMO
          </span>
          <span
            className="
                font-[500] xl:text-[20px] text-[14px] text-[#fff] mt-[20px]
            "
          >
            The current ITMO system faces challenges due to the existence of
            multiple reporting administrative structures. Startups and small
            businesses involved in climate technology development encounter
            obstacles such as human resource constraints and high costs. <br />
            <br />
            Consequently, the time required for the actual implementation of
            projects is prolonged, leading to a sluggish progression of the
            initiatives. Addressing these issues, a novel solution leveraging
            generative AI could efficiently streamline administrative processes,
            ranging from calculating carbon reduction quantities to document
            creation, thereby significantly enhancing the overall efficiency of
            the business operations.
          </span>

          <div
            className="
            relative w-[1020px] h-[759px] xl:flex hidden
            "
          >
            <Image
              src="/carbonai/diagram_ai_pc.png"
              layout="fill"
              objectFit="contain"
              alt="carbon credit market"
              quality={100}
            />
          </div>
          <div
            className="
            relative w-[300px] h-[588px] xl:hidden flex
            "
          >
            <Image
              src="/carbonai/diagram_ai_mobile.png"
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
