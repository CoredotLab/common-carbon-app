"use client";

import type { NextPage } from "next";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface BannerContent {
  imageSrc: string;
  slogan: string[];
}

const banners: BannerContent[] = [
  {
    imageSrc: "/calculator/banner1.png",
    slogan: ["Empowering Carbon Reduction,", "One Calculation at a Time."],
  },
  {
    imageSrc: "/calculator/banner2.png",
    slogan: ["Effortless Carbon Report", "Analysis with AI"],
  },
  {
    imageSrc: "/calculator/banner3.png",
    slogan: ["Together for a", "Greener Future"],
  },
];

export default function Page() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <SigninBox />
    </div>
  );
}

const SigninBox: NextPage = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  // 자동 전환을 위한 interval ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 터치 제스처를 위한 상태
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // 자동 전환 useEffect
  useEffect(() => {
    // 3초마다 다음 배너로 넘어가기
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 3000);
    };

    startAutoSlide();

    return () => {
      // 컴포넌트 언마운트 시 interval 해제
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 인디케이터 클릭 시 특정 배너로 이동
  const handleIndicatorClick = (index: number) => {
    setCurrentBanner(index);
    // 인디케이터 클릭 시 interval 리셋 (사용자 조작 반영)
    resetInterval();
  };

  // 인터벌 재시작 함수(사용자 조작 발생 시 자동 슬라이드 재시작)
  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
  };

  // 터치 시작 시 위치 저장
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // 터치 종료 시 스와이프 방향 계산
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - touchStartX;

    if (Math.abs(deltaX) > 50) {
      // 왼쪽 스와이프 (deltaX < 0)이면 다음 배너
      if (deltaX < 0) {
        nextBanner();
      } else {
        prevBanner();
      }
      resetInterval();
    }

    setTouchStartX(null);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="w-full max-w-[480px] relative rounded-number-common-radius-md bg-color-common-white overflow-hidden flex flex-col items-center justify-start text-left text-[28px] text-lightseagreen font-eurostile">
      <div
        className="self-stretch relative bg-black h-[480px] overflow-hidden shrink-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 현재 배너 이미지 */}
        <Image
          className="absolute top-0 left-0 w-[480px] h-[480px] object-cover"
          width={480}
          height={480}
          alt=""
          src={banners[currentBanner].imageSrc}
        />
        {/* 그라디언트 오버레이 */}
        <div
          className="absolute top-0 left-0 w-[480px] h-[480px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,9,0,0.6), rgba(5,77,64,0.2))",
          }}
        />
        {/* 인디케이터 */}
        <div className="absolute bottom-[24px] left-1/2 transform -translate-x-1/2 flex flex-row items-center gap-2">
          {banners.map((_, index) => (
            <div
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={`cursor-pointer w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentBanner
                  ? "bg-color-common-white w-10"
                  : "bg-color-common-white/50"
              }`}
            />
          ))}
        </div>
        {/* 로고 및 타이틀 */}
        <div className="absolute top-[24px] left-[24px] w-[146px] h-[47.5px]">
          <Image
            width={142}
            height={14}
            alt="logo_cc"
            src="/calculator/logo_cc.svg"
          />
          <b className="block mt-2 leading-[28px] text-color-common-white">
            AI assistant
          </b>
        </div>
        {/* 슬로건 */}
        <b className="absolute top-[88.5px] left-[21px] text-5xl leading-[32px] font-label-large-bold text-color-common-white">
          {banners[currentBanner].slogan.map((line, i) => (
            <p className="m-0" key={i}>
              {line}
            </p>
          ))}
        </b>
      </div>
      {/* 구글 로그인 버튼 */}
      <div className="self-stretch h-20 flex flex-row items-center justify-center p-2 box-border gap-2 text-lg text-color-text-default font-label-large-bold">
        <Image
          className="w-[23.5px] relative h-6"
          width={24}
          height={24}
          alt=""
          src="/calculator/logo_google.svg"
        />
        <b className="relative leading-[20px]">Continue with Google</b>
      </div>
    </div>
  );
};
