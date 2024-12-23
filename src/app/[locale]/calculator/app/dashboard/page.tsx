"use client";

import Filter2 from "@/app/[locale]/cim/components/filter2";
import CimGraph2 from "@/app/[locale]/cim/components/graph2";
import CimTable2 from "@/app/[locale]/cim/components/table2";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSelectedStore from "@/store/useSelectedStore";
import axios from "axios";

interface HistorySession {
  session_id: string;
  hc_name: string;
  mt_name: string;
  reduction_value: number;
  scenario_type: string;
  mode: string;
  updated_at: string | null;
}

export default function Page() {
  const router = useRouter();
  const { setCountry, setTechnology } = useSelectedStore();

  // 페이지네이션 관련 state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // 고정(5) 혹은 슬라이더/드롭다운으로 선택
  const [totalCount, setTotalCount] = useState(0);
  const [historyList, setHistoryList] = useState<HistorySession[]>([]);
  const totalPages = Math.ceil(totalCount / pageSize);

  // API 호출
  const fetchHistory = async (pageNum: number, pageSz: number) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/calc_session/list_history`,
        {
          params: { page: pageNum, page_size: pageSz },
          withCredentials: true, // 쿠키 인증
        }
      );
      const data = res.data;
      setHistoryList(data.data || []);
      setTotalCount(data.total_count || 0);
    } catch (error) {}
  };

  // 컴포넌트 마운트/ page 변경 시 목록 갱신
  useEffect(() => {
    fetchHistory(page, pageSize);
  }, [page, pageSize]);

  // 리스트 행 클릭 => view 모드로 이동
  const handleRowClick = (sessionId: string) => {
    // 만약 recordId 대신 session_id로 통일했다면:
    router.push(`/en/calculator/app/step1-a?mode=view&session_id=${sessionId}`);
  };

  // +New Cal 버튼
  const handleNewCal = () => {
    // zustand reset
    setCountry("");
    setTechnology("");
    // step1-a?mode=create 로 이동
    router.push(`/en/calculator/app/step1-a?mode=create`);
  };

  // Prev / Next
  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div className="w-full p-4 md:flex-row flex-col flex md:gap-4 gap-2">
      {/* Left panel: 예시로 Filter, Graph, Table */}
      <div className="w-full max-w-[542px] flex flex-col bg-white bg-opacity-[40%] rounded-[12px] gap-3">
        <Filter2 />
        <div className="w-full flex flex-col p-8">
          <CimGraph2 />
        </div>
        <div className="flex flex-col p-8">
          <CimTable2 />
        </div>
      </div>

      {/* Right panel: History list + New Cal + pagination */}
      <div className="w-full max-w-[794px] flex flex-col bg-white bg-opacity-[40%] rounded-[12px] gap-3 p-8">
        {/* New Cal Button */}
        <div
          onClick={handleNewCal}
          className="w-[120px] relative rounded-number-common-radius-full
                     [background:linear-gradient(180deg,_#0d5247,_#0a3e36)]
                     flex flex-row items-center justify-center py-2 px-[8px]
                     box-border text-left text-sm text-color-common-white
                     font-label-small-bold cursor-pointer"
        >
          <b className="relative leading-[16px]">+New Cal</b>
        </div>

        {/* History Table */}
        <div
          className="w-full relative overflow-hidden flex flex-col
                        items-start justify-start gap-1 text-left text-xs
                        text-color-text-default font-body-tiny"
        >
          {/* Header Row */}
          <div
            className="self-stretch rounded-number-common-radius-sm bg-gray-200
                          overflow-hidden flex flex-row items-start
                          justify-start h-11"
          >
            <div
              className="self-stretch w-16 border-gray-100 border-r-[1px]
                            border-solid flex flex-row items-center
                            justify-center py-2 px-3 text-center"
            >
              <b className="flex-1 leading-[14px]">#</b>
            </div>
            <div
              className="self-stretch flex-1 border-gray-100 border-r-[1px]
                            border-solid flex flex-row items-center
                            justify-center py-2 px-3"
            >
              <b className="flex-1 leading-[14px]">Country</b>
            </div>
            <div
              className="self-stretch flex-1 border-gray-100 border-r-[1px]
                            border-solid flex flex-row items-center
                            justify-center py-2 px-3"
            >
              <b className="flex-1 leading-[14px]">Technology</b>
            </div>
            <div
              className="self-stretch flex-1 border-gray-100 border-r-[1px]
                            border-solid flex flex-row items-center
                            justify-center py-2 px-3"
            >
              <b className="flex-1 leading-[14px]">Scenario</b>
            </div>
            <div
              className="self-stretch flex-1 border-gray-100 border-r-[1px]
                            border-solid flex flex-row items-center
                            justify-center py-2 px-3"
            >
              <b className="flex-1 leading-[14px]">Reduction</b>
            </div>
            <div
              className="self-stretch flex-1 flex flex-row items-center
                            justify-center py-2 px-3"
            >
              <b className="flex-1 leading-[14px]">Updated</b>
            </div>
          </div>

          {/* Data Rows */}
          {historyList.map((item, idx) => (
            <div
              key={item.session_id}
              className="self-stretch rounded-number-common-radius-sm
                         overflow-hidden flex flex-row items-start
                         justify-start bg-white bg-opacity-[40%]
                         cursor-pointer h-11 gap-1"
              onClick={() => handleRowClick(item.session_id)}
            >
              <div
                className="self-stretch w-16 flex flex-row items-center
                              justify-center py-2 px-3 box-border text-center"
              >
                {/* 전체 목록 중 # => (page-1)*pageSize + idx+1 */}
                <div className="flex-1 leading-[14px]">
                  {idx + 1 + (page - 1) * pageSize}
                </div>
              </div>
              <div
                className="self-stretch flex-1 flex flex-row items-center
                              justify-center py-2 px-3"
              >
                <div className="flex-1 leading-[14px]">{item.hc_name}</div>
              </div>
              <div
                className="self-stretch flex-1 flex flex-row items-center
                              justify-center py-2 px-3"
              >
                <div className="flex-1 leading-[14px]">{item.mt_name}</div>
              </div>
              <div
                className="self-stretch flex-1 flex flex-row items-center
                              justify-center py-2 px-3"
              >
                <div className="flex-1 leading-[14px]">
                  {item.scenario_type}
                </div>
              </div>
              <div
                className="self-stretch flex-1 flex flex-row items-center
                              justify-center py-2 px-3"
              >
                <div className="flex-1 leading-[14px]">
                  {item.reduction_value?.toLocaleString?.() || 0}
                </div>
              </div>
              <div
                className="self-stretch flex-1 flex flex-row items-center
                              justify-center py-2 px-3"
              >
                <div className="flex-1 leading-[14px]">
                  {item.updated_at?.substring(0, 10) || ""}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="mt-4 flex flex-row gap-2 items-center justify-center">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="rounded bg-gray-200 py-1 px-2 disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <div>
              Page {page} / {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className="rounded bg-gray-200 py-1 px-2 disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
