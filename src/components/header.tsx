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

  const isActive = (_path: string) => {
    const pathSplit = path.split("/");
    console.debug(pathSplit);
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
    <header className="top-0 fixed w-full min-w-[360px] flex justify-between items-center bg-white border-b-[1px] border-app_gray z-50">
      <div className="w-[221px] h-[22px] p-[10px] flex flex-col justify-center">
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
  );
}
