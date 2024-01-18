"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();
  const isHome = path === "/en" || path === "/ko";

  return (
    <footer
      className="hidden md:flex w-full justify-between items-center py-[23px] px-[20px] border-t-[1px] border-app_gray"
      style={{
        backgroundColor: isHome ? "#001D03" : "#fff",
        borderColor: isHome ? "#CECECE" : "#fff",
      }}
    >
      <span
        className="text-[14px] font-[300] -tracking-[0.28px]"
        style={{
          color: isHome ? "#fff" : "#000",
        }}
      >
        Common Carbon
      </span>
      <span
        className="text-[14px] font-[300] -tracking-[0.28px]"
        style={{
          color: isHome ? "#fff" : "#000",
        }}
      >
        contact : kwangnam.ryu.kor@gmail.com
      </span>
    </footer>
  );
}
