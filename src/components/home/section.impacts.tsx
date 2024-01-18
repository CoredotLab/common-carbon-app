"use client";
import Image from "next/image";
import { useState } from "react";

export default function SectionImpacts() {
  return (
    <main className="w-full flex items-center justify-center xl:h-[700px] bg-[#001D03]">
      <div className="w-full flex xl:flex-row flex-col h-full max-w-[1440px] items-center xl:space-x-[160px] xl:py-[0px] py-[20px] xl:px-[0px] px-[20px] xl:space-y-[0px] space-y-[30px]">
        <ImpactImage />
        <ImpactInformations />
      </div>
    </main>
  );
}

function ImpactImage() {
  return (
    <div className="relative xl:h-[500px] xl:w-[540px] w-full max-w-[500px] aspect-[540/500]">
      <Image
        src="/home/image_impact.png"
        fill
        quality={100}
        alt="impact image"
      />
    </div>
  );
}

type ScoreCardProps = {
  scoreText: string;
  scoreTitleF: string;
  scoreTitleS: string;
};

function ImpactInformations() {
  const [scoreIndex, setScoreIndex] = useState(0);
  const scoreCards: ScoreCardProps[] = [
    {
      scoreText: "100 +",
      scoreTitleF: "Tracking",
      scoreTitleS: "Methodologies",
    },
    {
      scoreText: "30 MtCO2 +",
      scoreTitleF: "Carbon reduction",
      scoreTitleS: "from CommonCarbon",
    },
    {
      scoreText: "$ 33M +",
      scoreTitleF: "Total financial",
      scoreTitleS: "carbon impact",
    },
  ];

  const handleArrowClick = (direction: "left" | "right") => {
    if (direction === "left") {
      if (scoreIndex === 0) {
        setScoreIndex(scoreCards.length - 1);
      } else {
        setScoreIndex(scoreIndex - 1);
      }
    } else {
      if (scoreIndex === scoreCards.length - 1) {
        setScoreIndex(0);
      } else {
        setScoreIndex(scoreIndex + 1);
      }
    }
  };

  return (
    <div className="flex flex-col xl:space-y-[60px] space-y-[30px]">
      <div className="flex flex-col space-y-[10px]">
        <span className="text-primary xl:text-[30px] text-[20px] font-[600]">
          Common Carbon Impacts
        </span>
        <span className="text-white xl:text-[18px] text-[14px] font-[500] xl:max-w-[600px]">
          Common Carbon was launched in 2024 and is dedicated to striving for
          carbon neutrality for our planet.
        </span>
      </div>
      {/* scores cards */}
      <div className="flex h-[200px] xl:w-[600px] w-full flex-col items-start justify-center space-y-[60px]">
        {/* cards */}
        <div className="flex items-center justify-between w-full">
          <div
            className="relative w-[24px] h-[24px] cursor-pointer"
            onClick={() => handleArrowClick("left")}
          >
            <Image
              src="/icon_chevron_left.svg"
              fill
              quality={100}
              alt="arrow left"
            />
          </div>

          <span className="xl:text-[40px] text-[24px] font-[600] text-white">
            {scoreCards[scoreIndex].scoreText}
          </span>
          <span className="xl:text-[18px] text-[14px] font-[400] text-white">
            {scoreCards[scoreIndex].scoreTitleF}
            <br />
            {scoreCards[scoreIndex].scoreTitleS}
          </span>

          <div
            className="relative w-[24px] h-[24px] cursor-pointer"
            onClick={() => handleArrowClick("right")}
          >
            <Image
              src="/icon_chevron_right.svg"
              fill
              quality={100}
              alt="arrow right"
            />
          </div>
        </div>
        {/* indicator */}
        <div className="flex items-center justify-center space-x-[10px] w-full">
          {scoreCards.map((_, index) => (
            <div
              key={index}
              className={`w-[8px] h-[8px] rounded-full ${
                index === scoreIndex ? "bg-primary" : "bg-[#CFCFCF]"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
