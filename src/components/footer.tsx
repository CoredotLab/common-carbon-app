"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();
  const isHome = path === "/en" || path === "/ko";
  const isCarbonai = path === "/en/carbonai" || path === "/ko/carbonai";
  const isHomeCarbonai = isHome || isCarbonai;

  return (
    <footer
      className="hidden md:flex w-full justify-between items-center py-[23px] px-[20px] border-t-[1px] border-app_gray"
      style={{
        backgroundColor: isHomeCarbonai ? "#001D03" : "#fff",
        borderColor: isHomeCarbonai ? "#CECECE" : "#fff",
      }}
    >
      <span
        className="text-[14px] font-[300] -tracking-[0.28px]"
        style={{
          color: isHomeCarbonai ? "#fff" : "#000",
        }}
      >
        © 2024 CommonCarbon.ai. or its affiliates. The commoncarbon.ai project
        authors. All rights reserved. <br />
        G708, 115, Heyground, Wangsimni-ro, Seongdong-gu, Seoul, Republic of
        Korea
      </span>
      <span
        className="text-[14px] font-[300] -tracking-[0.28px]"
        style={{
          color: isHomeCarbonai ? "#fff" : "#000",
        }}
      >
        commoncarbon@ourfuture.kr
      </span>
    </footer>
  );
}
