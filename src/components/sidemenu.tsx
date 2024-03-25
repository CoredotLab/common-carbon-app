"use client";
import { menuState } from "@/recoil/menuState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Image from "next/image";
import { Link } from "@/navigation";
import { usePathname } from "next/navigation";

export default function SideMenu() {
  const valueMenuState = useRecoilValue(menuState);
  const setMenuState = useSetRecoilState(menuState);
  const sideMenuClass = valueMenuState ? "translate-x-0" : "-translate-x-full";
  const path = usePathname();
  const isHome = path === "/en" || path === "/ko";
  const isCarbonai = path === "/en/carbonai" || path === "/ko/carbonai";
  const isHomeCarbonai = isHome || isCarbonai;

  const isActive = (_path: string) => {
    const pathSplit = path.split("/");

    if (pathSplit.length === 2 && _path === "") {
      return "text-primary";
    }
    if (pathSplit.length === 3 && pathSplit[2] === _path) {
      return "text-primary";
    }
  };

  return (
    <>
      {valueMenuState && (
        <div
          className={`xl:hidden flex flex-col space-y-[40px] fixed top-0 right-0 h-full bg-white w-[200px] z-50 transform transition-transform ${sideMenuClass} border border-l-[1px] border-[#000000] border-opacity-[20%]`}
          style={{
            backgroundColor: isHomeCarbonai ? "#001D03" : "#fff",
          }}
        >
          <div
            className="flex items-center h-[70px] px-[20px] border border-b-[1px] border-[#000000] border-opacity-[20%]"
            style={{
              borderBottomColor: isHomeCarbonai ? "#CECECE" : "#000",
            }}
          >
            <button
              onClick={() => setMenuState(false)}
              className="w-[24px] h-[24px] flex justify-center items-center"
            >
              <Image
                src="/icon_x.png"
                alt="icon_close"
                width={20}
                height={20}
                style={{
                  filter: isHomeCarbonai ? "brightness(0) invert(1)" : "none",
                }}
              />
            </button>
          </div>
          <nav
            className="flex flex-col  justify-center items-center"
            style={{
              color: isHomeCarbonai ? "#fff" : "#000",
            }}
          >
            <Link
              href="/"
              className={`w-full h-[60px] flex justify-center items-center ${isActive(
                ""
              )}`}
              onClick={() => setMenuState(false)}
            >
              HOME
            </Link>
            <Link
              href="/carbonai"
              className={`w-full h-[60px] flex justify-center items-center ${isActive(
                "carbonai"
              )}`}
            >
              CarbonAI
            </Link>
            <Link
              href="/cim"
              className={`w-full h-[60px] flex justify-center items-center ${isActive(
                "cim"
              )}`}
              onClick={() => setMenuState(false)}
            >
              CIM
            </Link>
            <Link
              href="/cal/gemini"
              className={`w-full h-[60px] flex justify-center items-center ${isActive(
                "cal"
              )}`}
            >
              CAL
            </Link>
            <Link
              href="/"
              className={`w-full h-[60px] flex justify-center items-center ${isActive(
                "pdd"
              )}`}
              onClick={() => {
                alert("Service will be available soon!");
                setMenuState(false);
              }}
            >
              PDD
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
