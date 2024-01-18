"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SectionProjects() {
  const router = useRouter();
  return (
    <main className="w-full flex flex-col">
      {/* cim */}
      <div className="w-full bg-[#FFFEF2] flex items-center justify-center">
        <div className="w-full max-w-[1440px] flex xl:flex-row flex-col xl:space-x-[60px] items-center">
          <div className="relative xl:h-[500px] h-[240px] xl:w-[700px] w-[340px]">
            <Image
              src="/home/project_cim.png"
              layout="fill"
              objectFit="contain"
              alt="project image"
            />
          </div>
          <div className="flex min-w-[300px] flex flex-col space-y-[21px] xl:p-[0px] p-[20px]">
            <span className="text-[#062425] xl:text-[30px] text-[18px] font-[500]">
              Carbon Impact Map(CIM)
            </span>
            <span className="text-black xl:text-[16px] text-[14px] font-[400] max-w-[600px]">
              The Carbon Impact Map (CIM) is a global map showcasing the current
              carbon reduction efforts worldwide, offering a detailed view of
              each country&apos;s carbon reductions by technology.
            </span>
            <button
              className="w-[120px] h-[36px] bg-primary text-white p-[10px] flex items-center justify-center text-[14px] font-[600]"
              onClick={() => router.push("/en/cim")}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* cal */}
      <div className="w-full bg-[#B1D2D2] flex items-center justify-center min-h-[500px]">
        <div className="w-full max-w-[1440px] flex xl:flex-row-reverse flex-col items-center xl:px-[100px]">
          <div className="relative xl:h-[380px] h-[250px] xl:w-[454px] w-[300px] xl:ml-[160px]">
            <Image
              src="/home/project_cal.png"
              layout="fill"
              objectFit="contain"
              alt="project image"
            />
          </div>
          <div className="flex min-w-[300px] flex flex-col space-y-[21px] xl:p-[0px] p-[20px]">
            <span className="text-[#062425] xl:text-[30px] text-[18px] font-[500]">
              Carbon Calculator(CAL)
            </span>
            <span className="text-black xl:text-[16px] text-[14px] font-[400] max-w-[600px]">
              The Carbon Calculator (CAL) simplifies calculations for carbon
              reduction methodologies, aiding in assessing the feasibility and
              potential success of carbon mitigation projects.
            </span>
            <button
              className="w-[120px] h-[36px] bg-primary text-white p-[10px] flex items-center justify-center text-[14px] font-[600]"
              onClick={() => alert("Service will be available soon!")}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* pdd */}
      <div className="w-full bg-[#F7CE65] flex items-center justify-center min-h-[500px]">
        <div className="w-full max-w-[1440px] flex xl:flex-row flex-col items-center xl:px-[100px] xl:space-x-[200px]">
          <div className="relative xl:h-[380px] h-[250px] xl:w-[454px] w-[300px]">
            <Image
              src="/home/project_pdd.png"
              layout="fill"
              objectFit="contain"
              alt="project image"
            />
          </div>
          <div className="flex min-w-[300px] flex flex-col space-y-[21px] xl:p-[0px] p-[20px]">
            <span className="text-[#062425] xl:text-[30px] text-[18px] font-[500]">
              PDD Generator(PDD)
            </span>
            <span className="text-black xl:text-[16px] text-[14px] font-[400] max-w-[600px]">
              The PDD Generator (PDD) is a tool that utilizes generative AI to
              simplify the creation of lengthy and time-consuming business plans
              for carbon reduction projects, saving time and effort and enabling
              a quicker start to carbon mitigation.
            </span>
            <button
              className="w-[120px] h-[36px] bg-primary text-white p-[10px] flex items-center justify-center text-[14px] font-[600]"
              onClick={() => alert("Service will be available soon!")}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
