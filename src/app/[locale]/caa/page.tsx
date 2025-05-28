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
    imageSrc: "/caa/caa_banner.svg",
    slogan: ["Empowering Carbon Reduction,", "One Calculation at a Time."],
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
        const res = await axios.get("/auth/me", { withCredentials: true });
        // 인증 성공하면 대시보드로 이동
        localStorage.setItem("email", res.data.email);
        router.push("/en/caa/chat");
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

      // console.log("Google ID Token:", idToken);

      const res = await axios.post(
        "/auth/login",
        { idToken }
        // { withCredentials: true }
      );

      toast.success("Successfully logged in!");
      // 로그인 성공 시 대시보드로 이동
      router.push("/en/caa/chat");
    } catch (error) {
      toast.error("Failed to login. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-[480px] relative rounded-number-common-radius-md bg-color-common-white overflow-hidden flex flex-col items-center justify-start text-left text-[28px] text-lightseagreen font-eurostile">
      <div
        className="self-stretch relative h-[480px] overflow-hidden shrink-0"
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
      </div>

      <div className="w-full relative flex flex-col items-center justify-start p-8 box-border gap-6 text-center text-typography-body-body-medium text-text-default font-Body-Medium-Bold">
        <div className="flex flex-col items-center justify-start gap-3">
          <Image
            className="w-[281px] relative h-[25px]"
            width={281}
            height={25}
            alt=""
            src="/caa/logo.svg"
          />
          <b className="w-[245px] relative leading-typography-body-body-medium-lineHeight inline-block text-[#1c211f]">
            Empowering Carbon Reduction, One Calculation at a Time.
          </b>
        </div>
        <div
          onClick={handleGoogleLogin}
          className="self-stretch rounded-lg bg-white border-text-default border-solid border-[1px] box-border h-14 flex flex-row items-center justify-center p-2 gap-2 text-left text-Number-typography-label-large text-color-text-default font-Label-Large-Bold cursor-pointer"
        >
          <Image
            className="w-[23.5px] relative h-6"
            width={24}
            height={24}
            alt=""
            src="/calculator/logo_google.svg"
          />
          <b className="relative leading-Number-typography-label-large-lineHeight">
            Continue with Google
          </b>
        </div>
      </div>
    </div>
  );
};
