"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  verifierState, // ▶︎ NEW
  acState,
  hcState,
  mtState,
} from "@/recoil/filterState";
import { useWindowResize } from "@/hooks/useWindowResize";
import { detailInfoState } from "@/recoil/detailInfoState";

interface RowResponse {
  row: string;
  reduction: number;
}
interface TableResponse {
  subject: string;
  data: RowResponse[];
}

export default function CimTable() {
  /* ───────── 상태 ───────── */
  const [tableData, setTableData] = useState<RowResponse[]>([]);
  const [tableSubject, setTableSubject] = useState("Country");
  const [totalReduction, setTotalReduction] = useState(0);

  /* ───────── 필터 값 ───────── */
  const verifier = useRecoilValue(verifierState); // ▶︎ NEW
  const ac = useRecoilValue(acState);
  const hc = useRecoilValue(hcState);
  const mt = useRecoilValue(mtState);

  /* 기타 상태 */
  const innerWidth = useWindowResize();
  const detail = useRecoilValue(detailInfoState);
  const setDetail = useSetRecoilState(detailInfoState);

  const handleClickedMoreInfo = () => setDetail(!detail);

  /* ---------- 데이터 요청 함수 ---------- */
  const fetchTable = useCallback(async () => {
    const p = new URLSearchParams();
    if (verifier !== "All") p.append("verifier", verifier); // ▶︎ NEW
    if (ac !== "All") p.append("ac", ac);
    if (hc !== "All") p.append("hc", hc);
    if (mt !== "All") p.append("mt", mt);

    try {
      const { data, status } = await axios.get<TableResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/table?${p.toString()}`
      );
      if (status === 200) {
        setTableSubject(data.subject);
        const rows = data.data;

        /* 길이 조정 (15행 고정/모바일) */
        const isMobile = window.innerWidth < 768;
        let processed = rows.slice(0, 15);
        if (!isMobile && processed.length < 15) {
          processed = processed.concat(
            Array(15 - processed.length).fill({ row: "", reduction: -1 })
          );
        }
        if (isMobile) {
          // 뒤쪽 빈칸 제거
          while (
            processed.length &&
            processed[processed.length - 1].reduction === -1
          )
            processed.pop();
        }
        setTableData(processed);

        /* 총합 */
        setTotalReduction(rows.reduce((acc, cur) => acc + cur.reduction, 0));
      }
    } catch (_) {
      /* 에러 무시 */
    }
  }, [verifier, ac, hc, mt]);

  /* ---------- 효과 ---------- */
  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  /* 창 크기 변화에 따른 테이블 길이 재조정 */
  useEffect(() => {
    if (!tableData.length) return;
    const isMobile = innerWidth < 768;
    if (isMobile && tableData[tableData.length - 1].reduction === -1) {
      setTableData(tableData.filter((r) => r.reduction !== -1));
    } else if (!isMobile && tableData.length < 15) {
      setTableData(
        tableData.concat(
          Array(15 - tableData.length).fill({ row: "", reduction: -1 })
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerWidth]);

  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  /* ---------- 렌더 ---------- */
  return (
    <main className="flex flex-col w-full md:min-h-[519px] shrink-0">
      <span className="py-[10px] text-[12px] font-[700]">
        Global Carbon Reduction Performance Table
      </span>

      <table className="w-full flex-1">
        <thead>
          <tr className="text-[12px] font-[700] bg-primary text-white text-center">
            <th className="w-[17.5%] border text-start p-[10px]">Index</th>
            <th className="w-[41.25%] border text-start p-[10px]">
              {tableSubject}
            </th>
            <th className="w-[41.25%] border text-start p-[10px]">
              Carbon Reduction(tCO2)
            </th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          {tableData.map((d, i) => (
            <tr key={i} className={`h-[24px] ${i % 2 ? "bg-[#E6F8F5]" : ""}`}>
              <td className={d.row ? "text-center" : "opacity-0"}>{i + 1}</td>
              <td className="pl-[10px]">{d.row}</td>
              <td className="pl-[10px]">
                {d.reduction === -1 ? "" : fmt(d.reduction)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex w-full justify-between bg-[#E6F8F5] border border-t-primary py-[6px] px-[10px]">
        <span className="text-[12px] font-[700]">Total Carbon Reduction</span>
        <div className="text-[#007865]">
          <span className="text-[12px] font-[600]">{fmt(totalReduction)}</span>
          <span className="text-[10px] font-[400]"> tCO2</span>
        </div>
      </div>

      {/* desktop 전용 More-info 버튼 */}
      <button
        onClick={handleClickedMoreInfo}
        className="md:flex hidden w-full justify-end items-center h-[36px] space-x-[10px]"
      >
        <span className="text-primary text-[12px]">
          More detail information
        </span>
        <Image src="/cim/arrow_down.png" width={10} height={20} alt="more" />
      </button>
    </main>
  );
}
