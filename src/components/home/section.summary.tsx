"use client";
import Image from "next/image";

export default function SectionSummary() {
  return (
    <main className="w-full flex justify-center xl:items-center items-start bg-[#001D03] min-h-[360px] xl:flex-row flex-col xl:space-x-[120px] xl:space-y-[0px] space-y-[30px] xl:py-[0px] py-[30px] xl:px-[0px] px-[20px]">
      <div className="flex flex-col justify-center xl:space-y-[58px] space-y-[30px] ">
        <div className="flex flex-col space-y-[20px]">
          <span className="xl:text-[20px] text-[18px] font-[600] text-[#F9F7C9]">
            Contact
          </span>
          <span className="xl:text-[16px] text-[14px] font-[300] text-white">
            contact : kwangnamryu@ourfuture.kr
          </span>
        </div>
        <div className="flex flex-col space-y-[20px]">
          <span className="xl:text-[20px] text-[18px] font-[600] text-[#F9F7C9]">
            Link
          </span>
          <div className="flex space-x-[30px] items-center -ml-[13px]">
            <a
              className="relative w-[100px] h-[40px]"
              href="http://ourfuture.kr/"
              target="_blank"
            >
              <Image
                src="/home/link_umirae.png"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </a>
            <a
              className="relative w-[100px] h-[14px]"
              href="https://coredot.io/"
              target="_blank"
            >
              <Image
                src="/home/link_coredotlab.svg"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </a>
            <a className="relative w-[29px] h-[30px]">
              <Image
                src="/home/link_x.svg"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </a>
            <a className="relative w-[30px] h-[30px]">
              <Image
                src="/home/link_linkedin.svg"
                layout="fill"
                objectFit="contain"
                alt="partner image"
                quality={100}
              />
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center xl:space-y-[58px] space-y-[30px] ">
        <div className="flex flex-col space-y-[30px] xl:h-[230px]">
          <span className="xl:text-[20px] text-[18px] font-[600] text-[#F9F7C9]">
            Project
          </span>
          <div className="flex flex-col space-y-[20px] text-start text-white text-[14px] font-[600]">
            <a className="" href="/en/cim">
              Carbon Impact MAP
            </a>
            <button
              className="text-start"
              onClick={() => alert("Service will be available soon!")}
            >
              Carbon Calculator
            </button>
            <button
              className="text-start"
              onClick={() => alert("Service will be available soon!")}
            >
              pre PDD Generator
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
