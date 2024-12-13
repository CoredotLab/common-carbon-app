"use client";

import { Link } from "@/navigation";
import { menuState } from "@/recoil/menuState";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useEffect, useState } from "react";

export default function Header() {
  const path = usePathname();
  const setMenuState = useSetRecoilState(menuState);
  const valueMenuState = useRecoilValue(menuState);

  const [showHeader, setShowHeader] = useState(true);

  const isHome = path === "/en" || path === "/ko";
  const isCarbonai = path === "/en/carbonai" || path === "/ko/carbonai";
  const isCalculator = path === "/en/calculator" || path === "/ko/calculator";

  const isActive = (_path: string) => {
    const pathSplit = path.split("/");
    if (pathSplit.length === 2 && _path === "") return "text-primary";
    if (pathSplit.length === 3 && pathSplit[2] === _path) return "text-primary";
  };

  const handleMenuClick = () => {
    setMenuState(true);
  };

  useEffect(() => {
    if (!isCalculator) {
      setShowHeader(true);
      return;
    }

    // Calculator 페이지일 경우
    setShowHeader(false);

    const handleWheel = (e: WheelEvent) => {
      // 최상단(scrollY === 0)에서 사용자가 위로 스크롤(deltaY < 0) 시 헤더 표시
      if (window.scrollY === 0 && e.deltaY < 0) {
        setShowHeader(true);
        return;
      }

      // 헤더가 보이는 상태에서 아래로 스크롤 시(deltaY > 0) 헤더 숨기기
      if (e.deltaY > 0) {
        setShowHeader(false);
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isCalculator, path]);

  const headerStyle =
    isCalculator && !showHeader
      ? "transform -translate-y-full transition-transform duration-300"
      : "transform translate-y-0 transition-transform duration-300";

  return (
    <>
      {isHome || isCarbonai ? (
        <header
          className={`absolute h-[70px] top-0 w-full min-w-[360px] flex justify-between items-center bg-transparent z-50 ${headerStyle}`}
        >
          <div className="flex flex-col justify-center xl:ml-[40px] ml-[20px]">
            <Link href="/" className="relative w-[220px] h-[22px]">
              <Image
                src="/logo_cc_white.svg"
                alt="logo_cc"
                fill
                quality={100}
              />
            </Link>
          </div>
          <nav className="xl:flex hidden space-x-[40px] items-center text-[20px] font-[600] h-[70px] text-white xl:pr-[40px] pr-[20px]">
            <Link href="/" className={`flex justify-center ${isActive("")}`}>
              HOME
            </Link>
            <Link
              href="/carbonai"
              className={`flex justify-center ${isActive("carbonai")}`}
            >
              About CarbonAI
            </Link>
            <Link
              href="/cim"
              className={`flex justify-center ${isActive("cim")}`}
            >
              Map
            </Link>
            <Link
              href="/calculator"
              className={`flex justify-center ${isActive("calculator")}`}
            >
              Calculator
            </Link>
            <Link
              href=""
              className={`flex justify-center ${isActive("cac")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              AutoChecker
            </Link>
          </nav>
          <div className="xl:hidden pr-[20px] flex">
            <button
              onClick={handleMenuClick}
              className="relative w-[18px] h-[14px]"
            >
              <Image
                src="/icon_hambuger_white.svg"
                alt="icon_menu"
                fill
                layout="fixed"
              />
            </button>
          </div>
        </header>
      ) : (
        <header
          className={`top-0 fixed w-full min-w-[360px] flex justify-between items-center bg-white border-b-[1px] border-app_gray z-50 ${headerStyle}`}
        >
          <div className="w-[221px] h-[70px] p-[10px] flex flex-col justify-center">
            <Link href="/">
              <Image
                src="/logo_cc.png"
                alt="logo_cc"
                width={728}
                height={74}
                quality={100}
              />
            </Link>
          </div>

          <nav className="md:flex hidden pr-[20px] space-x-[40px] items-center text-[20px] font-[600] h-[70px]">
            <Link href="/" className={`flex justify-center ${isActive("")}`}>
              HOME
            </Link>
            <Link
              href="/carbonai"
              className={`flex justify-center ${isActive("carbonai")}`}
            >
              About CarbonAI
            </Link>
            <Link
              href="/cim"
              className={`flex justify-center ${isActive("cim")}`}
            >
              Map
            </Link>
            <Link
              href="/calculator"
              className={`flex justify-center ${isActive("calculator")}`}
            >
              Calculator
            </Link>
            <Link
              href=""
              className={`flex justify-center ${isActive("cac")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              AutoChecker
            </Link>
          </nav>
          <div className="md:hidden pr-[20px]">
            <button onClick={handleMenuClick}>
              <Image
                src="/icon_hambuger.png"
                alt="icon_menu"
                width={24}
                height={24}
                layout="fixed"
              />
            </button>
          </div>
        </header>
      )}
    </>
  );
}
