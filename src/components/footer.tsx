"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();

  /* ───────── footer 를 숨길 경로 ─────────
     · /en/caa …        : 전체 CAA 섹션
     · /ko/caa …
     필요에 따라 startsWith 조건을 더 추가하세요.                    */
  const hideFooter = path.startsWith("/en/caa") || path.startsWith("/ko/caa");

  if (hideFooter) return null; /* ←   여기!  */

  /* ───────── 기존 색상 로직 그대로 ───────── */
  const isHome = path === "/en" || path === "/ko";
  const isCarbonai = path === "/en/carbonai" || path === "/ko/carbonai";
  const isHomeOrCa = isHome || isCarbonai;

  return (
    <footer
      className="hidden md:flex w-full justify-between items-center
                 py-[23px] px-[20px] border-t-[1px] border-app_gray"
      style={{
        backgroundColor: isHomeOrCa ? "#001D03" : "#fff",
        borderColor: isHomeOrCa ? "#CECECE" : "#fff",
      }}
    >
      <span
        className="text-[14px] font-[300] -tracking-[0.28px]"
        style={{ color: isHomeOrCa ? "#fff" : "#000" }}
      >
        © 2024 CommonCarbon.ai (or its affiliates). All rights reserved. <br />
        G708, 115 Heyground, Wangsimni-ro, Seongdong-gu, Seoul, Republic of
        Korea
      </span>

      <span
        className="text-[14px] font-[300] -tracking-[0.28px]"
        style={{ color: isHomeOrCa ? "#fff" : "#000" }}
      >
        commoncarbon@ourfuture.kr
      </span>
    </footer>
  );
}
