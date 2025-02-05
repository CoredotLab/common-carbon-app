"use client";

import { NextPage } from "next";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { auth, provider } from "../../../../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import useAxios from "@/utils/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const router = useRouter();
  const axios = useAxios();

  useEffect(() => {
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 3000);
    };
    startAutoSlide();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 이미 쿠키가 있다면 /auth/me로 인증 상태 확인 후 대시보드로 보냄
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/auth/me", { withCredentials: true });
        // 인증 성공하면 대시보드로 이동
        router.push("/en/calculator/app/dashboard");
      } catch (error) {
        // 401 등 에러 발생 시 로그인 페이지 그대로 유지
      }
    };
    checkAuth();
  }, []);

  const handleIndicatorClick = (index: number) => {
    setCurrentBanner(index);
    resetInterval();
  };

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) nextBanner();
      else prevBanner();
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

  // 구글 로그인 핸들러: axios 사용
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await axios.post(
        "/auth/login",
        { idToken },
        { withCredentials: true }
      );

      toast.success("Successfully logged in!");
      // 로그인 성공 시 대시보드로 이동
      router.push("/en/calculator/app/dashboard");
    } catch (error) {
      toast.error("Failed to login. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-[480px] relative rounded-number-common-radius-md bg-color-common-white overflow-hidden flex flex-col items-center justify-start text-left text-[28px] text-lightseagreen font-eurostile">
      <div
        className="self-stretch relative bg-black h-[480px] overflow-hidden shrink-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          className="absolute top-0 left-0 w-[480px] h-[480px] object-cover"
          width={480}
          height={480}
          alt=""
          src={banners[currentBanner].imageSrc}
        />
        <div
          className="absolute top-0 left-0 w-[480px] h-[480px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,9,0,0.6), rgba(5,77,64,0.2))",
          }}
        />
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
        <b className="absolute top-[88.5px] left-[21px] md:text-5xl text-xl leading-[32px] font-label-large-bold text-color-common-white">
          {banners[currentBanner].slogan.map((line, i) => (
            <p className="m-0" key={i}>
              {line}
            </p>
          ))}
        </b>
      </div>
      <div className="self-stretch h-20 flex flex-row items-center justify-center p-2 box-border gap-2 text-lg text-color-text-default font-label-large-bold">
        <Image
          className="w-[23.5px] relative h-6"
          width={24}
          height={24}
          alt=""
          src="/calculator/logo_google.svg"
        />
        {/* 구글 로그인 버튼 (onClick 이벤트 추가) */}
        <button
          onClick={handleGoogleLogin}
          className="relative leading-[20px] bg-transparent border-none cursor-pointer font-label-large-bold text-color-text-default"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};
