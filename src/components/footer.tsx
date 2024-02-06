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
        © 2024 CommonCarbon.ai. or its affiliates. The commoncarbon.ai project
        authors. All rights reserved. <br />
        G708, 115, Heyground, Wangsimni-ro, Seongdong-gu, Seoul, Republic of
        Korea
      </span>
      <span
        className="text-[14px] font-[300] -tracking-[0.28px]"
        style={{
          color: isHome ? "#fff" : "#000",
        }}
      >
        contact : kwangnamryu@ourfuture.kr
      </span>
    </footer>
  );
}
