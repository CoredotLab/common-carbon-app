"use client";

import Filter2 from "@/app/[locale]/cim/components/filter2";
import CimGraph2 from "@/app/[locale]/cim/components/graph2";
import CimTable2 from "@/app/[locale]/cim/components/table2";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface TableRow {
  index: number;
  country: string;
  technology: string;
  methodology: string;
  reduction: number;
  datetime: string;
}

// 페이지네이션 컴포넌트
const Pager = () => {
  return (
    <div className="w-full relative flex flex-row items-center justify-center gap-0.5 text-left text-sm text-color-text-light font-label-small mt-4">
      {/* Prev Arrow */}
      <div className="w-8 rounded-lg bg-gray-200 h-8 flex flex-col items-center justify-center cursor-pointer">
        <Image
          className="w-[5px] h-2.5 object-contain"
          width={5}
          height={10}
          alt="prev"
          src="/calculator/icon_arrow_back.svg"
        />
      </div>
      {/* Page Numbers: 1 ~ 5 */}
      <div className="w-8 rounded-lg bg-gray-100 h-8 flex flex-col items-center justify-center text-color-text-default cursor-pointer">
        <b className="leading-[16px]">1</b>
      </div>
      <div className="w-8 rounded-lg bg-gray-200 h-8 flex flex-col items-center justify-center cursor-pointer">
        <div className="leading-[16px]">2</div>
      </div>
      <div className="w-8 rounded-lg bg-gray-200 h-8 flex flex-col items-center justify-center cursor-pointer">
        <div className="leading-[16px]">3</div>
      </div>
      <div className="w-8 rounded-lg bg-gray-200 h-8 flex flex-col items-center justify-center cursor-pointer">
        <div className="leading-[16px]">4</div>
      </div>
      <div className="w-8 rounded-lg bg-gray-200 h-8 flex flex-col items-center justify-center cursor-pointer">
        <div className="leading-[16px]">5</div>
      </div>
      {/* Next Arrow */}
      <div className="w-8 rounded-lg bg-gray-200 h-8 flex flex-col items-center justify-center cursor-pointer">
        <Image
          className="w-[5px] h-2.5 object-contain"
          width={5}
          height={10}
          alt="next"
          src="/calculator/icon_arrow_next.svg"
        />
      </div>
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  // 샘플 데이터 15개
  const [tableData] = useState<TableRow[]>([
    {
      index: 1,
      country: "Indonesia",
      technology: "Solar",
      methodology: "Meth-001",
      reduction: 93046,
      datetime: "2024-01-01",
    },
    {
      index: 2,
      country: "India",
      technology: "Wind",
      methodology: "Meth-002",
      reduction: 10708,
      datetime: "2024-01-02",
    },
    {
      index: 3,
      country: "Chile",
      technology: "Biomass",
      methodology: "Meth-003",
      reduction: 3398,
      datetime: "2024-01-03",
    },
    {
      index: 4,
      country: "Nigeria",
      technology: "Cookstove",
      methodology: "Meth-004",
      reduction: 18599,
      datetime: "2024-01-04",
    },
    {
      index: 5,
      country: "Kenya",
      technology: "LED",
      methodology: "Meth-005",
      reduction: 93457,
      datetime: "2024-01-05",
    },
    {
      index: 6,
      country: "Brazil",
      technology: "Hydro",
      methodology: "Meth-006",
      reduction: 92771,
      datetime: "2024-01-06",
    },
    {
      index: 7,
      country: "Nepal",
      technology: "Infra",
      methodology: "Meth-007",
      reduction: 9631,
      datetime: "2024-01-07",
    },
    {
      index: 8,
      country: "Ethiopia",
      technology: "Transportation",
      methodology: "Meth-008",
      reduction: 43359,
      datetime: "2024-01-08",
    },
    {
      index: 9,
      country: "Vietnam",
      technology: "Solar",
      methodology: "Meth-009",
      reduction: 95554,
      datetime: "2024-01-09",
    },
    {
      index: 10,
      country: "Ethiopia",
      technology: "Wind",
      methodology: "Meth-010",
      reduction: 43359,
      datetime: "2024-01-10",
    },
    {
      index: 11,
      country: "Rwanda",
      technology: "Biomass",
      methodology: "Meth-011",
      reduction: 2383,
      datetime: "2024-01-11",
    },
    {
      index: 12,
      country: "Bangladesh",
      technology: "Cookstove",
      methodology: "Meth-012",
      reduction: 2148,
      datetime: "2024-01-12",
    },
    {
      index: 13,
      country: "South Africa",
      technology: "Infra",
      methodology: "Meth-013",
      reduction: 1003,
      datetime: "2024-01-13",
    },
    {
      index: 14,
      country: "Peru",
      technology: "LED",
      methodology: "Meth-014",
      reduction: 3398,
      datetime: "2024-01-14",
    },
    {
      index: 15,
      country: "Pakistan",
      technology: "Solar",
      methodology: "Meth-015",
      reduction: 6599,
      datetime: "2024-01-15",
    },
  ]);

  const handleRowClick = (id: number) => {
    router.push(`/en/calculator/app/step1-a?mode=view&recordid=${id}`);
  };

  const handleNewCal = () => {
    router.push(`/en/calculator/app/step1-a?mode=create`);
  };

  return (
    <div className="w-full p-4 md:flex-row flex-col flex md:gap-4">
      {/* Left panel: Filter, Graph, Table */}
      <div className="w-full max-w-[542px] flex flex-col bg-white bg-opacity-[40%] rounded-[12px]">
        <Filter2 />
        <div className="w-full flex flex-col p-8">
          <CimGraph2 />
        </div>
        <div className="flex flex-col p-8">
          <CimTable2 />
        </div>
      </div>

      {/* Right panel: History list + New Cal button + Table + Pagination */}
      <div className="w-full max-w-[794px] flex flex-col bg-white bg-opacity-[40%] rounded-[12px] gap-3 p-8">
        {/* New Cal Button */}
        <div
          onClick={handleNewCal}
          className="w-[120px] relative rounded-number-common-radius-full [background:linear-gradient(180deg,_#0d5247,_#0a3e36)] flex flex-row items-center justify-center py-2 px-[8px] box-border text-left text-sm text-color-common-white font-label-small-bold cursor-pointer"
        >
          <b className="relative leading-[16px]">+New Cal</b>
        </div>

        {/* History Table Header */}
        <div className="w-full relative overflow-hidden flex flex-col items-start justify-start gap-1 text-left text-xs text-color-text-default font-body-tiny">
          {/* Header Row */}
          <div className="self-stretch rounded-number-common-radius-sm bg-gray-200 overflow-hidden flex flex-row items-start justify-start h-11">
            <div className="self-stretch w-16 border-gray-100 border-r-[1px] border-solid flex flex-row items-center justify-center py-2 px-3 text-center">
              <b className="flex-1 leading-[14px]">Index</b>
            </div>
            <div className="self-stretch flex-1 border-gray-100 border-r-[1px] border-solid flex flex-row items-center justify-center py-2 px-3">
              <b className="flex-1 leading-[14px]">Country</b>
            </div>
            <div className="self-stretch flex-1 border-gray-100 border-r-[1px] border-solid flex flex-row items-center justify-center py-2 px-3">
              <b className="flex-1 leading-[14px]">Technology</b>
            </div>
            <div className="self-stretch flex-1 border-gray-100 border-r-[1px] border-solid flex flex-row items-center justify-center py-2 px-3">
              <b className="flex-1 leading-[14px]">Methodology</b>
            </div>
            <div className="self-stretch flex-1 border-gray-100 border-r-[1px] border-solid flex flex-row items-center justify-center py-2 px-3">
              <b className="flex-1 leading-[14px]">Reduction</b>
            </div>
            <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
              <b className="flex-1 leading-[14px]">Date/Time</b>
            </div>
          </div>
          {/* Data Rows */}
          {tableData.map((data, index) => (
            <div
              key={index}
              className={`self-stretch rounded-number-common-radius-sm overflow-hidden flex flex-row items-start justify-start bg-white bg-opacity-[40%] cursor-pointer h-11 gap-1`}
              onClick={() => handleRowClick(data.index)}
            >
              <div className="self-stretch w-16 flex flex-row items-center justify-center py-2 px-3 box-border text-center">
                <div className="flex-1 leading-[14px]">{data.index}</div>
              </div>
              <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
                <div className="flex-1 leading-[14px]">{data.country}</div>
              </div>
              <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
                <div className="flex-1 leading-[14px]">{data.technology}</div>
              </div>
              <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
                <div className="flex-1 leading-[14px]">{data.methodology}</div>
              </div>
              <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
                <div className="flex-1 leading-[14px]">
                  {data.reduction.toLocaleString()}
                </div>
              </div>
              <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
                <div className="flex-1 leading-[14px]">{data.datetime}</div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <Pager />
        </div>
      </div>
    </div>
  );
}
