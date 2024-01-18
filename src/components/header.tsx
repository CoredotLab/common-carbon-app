"use client";

import { Link } from "@/navigation";
import { menuState } from "@/recoil/menuState";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function Header() {
  const path = usePathname();
  const setMenuState = useSetRecoilState(menuState);
  const valueMenuState = useRecoilValue(menuState);
  const isHome = path === "/en" || path === "/ko";

  const isActive = (_path: string) => {
    const pathSplit = path.split("/");

    if (pathSplit.length === 2 && _path === "") {
      return "text-primary";
    }
    if (pathSplit.length === 3 && pathSplit[2] === _path) {
      return "text-primary";
    }
  };

  const handleMenuClick = () => {
    setMenuState(true);
  };

  return (
    <>
      {isHome ? (
        <header className="absolute h-[70px] top-0 w-full min-w-[360px] flex justify-between items-center bg-transparent z-50">
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

          <nav className="xl:flex hidden space-x-[40px] flex items-center text-[20px] font-[600] h-[70px] text-white xl:pr-[40px] pr-[20px]">
            <Link
              href="/"
              className={`w-[76px] flex justify-center ${isActive("")}`}
            >
              HOME
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("cim")}`}
            >
              CIM
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("cal")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              CAL
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("pdd")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              PDD
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("profile")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              Profile
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
        <header className="top-0 fixed w-full min-w-[360px] flex justify-between items-center bg-white border-b-[1px] border-app_gray z-50">
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

          <nav className="md:flex hidden pr-[20px] space-x-[40px] flex items-center text-[20px] font-[600] h-[70px]">
            <Link
              href="/"
              className={`w-[76px] flex justify-center ${isActive("")}`}
            >
              HOME
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("cim")}`}
            >
              CIM
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("cal")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              CAL
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("pdd")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              PDD
            </Link>
            <Link
              href="/cim"
              className={`w-[76px] flex justify-center ${isActive("profile")}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              Profile
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
