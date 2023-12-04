"use client";

import { Link } from "@/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();

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

  return (
    <header className="top-0 fixed w-full min-w-[360px] flex justify-between items-center bg-white border-b-[1px] border-app_gray">
      <div className="h-[70px] p-[10px] flex">
        <Link href="/">
          <Image
            src="/logo_umirae.svg"
            alt="logo_umirae"
            width={155}
            height={60}
          />
        </Link>
      </div>

      <nav className="flex pr-[20px] space-x-[40px] flex items-center text-[20px] font-[600]">
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
          href="/cal"
          className={`w-[76px] flex justify-center ${isActive("cal")}`}
        >
          CAL
        </Link>
        <Link
          href="/pdd"
          className={`w-[76px] flex justify-center ${isActive("pdd")}`}
        >
          PDD
        </Link>
        <Link
          href="/profile"
          className={`w-[76px] flex justify-center ${isActive("profile")}`}
        >
          Profile
        </Link>
      </nav>
    </header>
  );
}
