"use client";

import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useSelectedStore from "@/store/useSelectedStore";
import axios from "axios";
import { useRouter } from "next/navigation";

// 기술별로 단계별 클래스를 미리 정의 (7단계: 0~10 -> index0, 11~20 -> index1, ..., 61~70 -> index6)
// 필요하다면 범위를 더 정교하게 나눌 수 있음
const solarClasses = [
  "bg-crimson-100",
  "bg-crimson-200",
  "bg-crimson-300",
  "bg-crimson-400",
  "bg-crimson-500",
  "bg-crimson-600",
  "bg-crimson-700",
];

const windClasses = [
  "bg-mediumseagreen-100",
  "bg-mediumseagreen-200",
  "bg-mediumseagreen-300",
  "bg-mediumseagreen-400",
  "bg-mediumseagreen-500",
  "bg-mediumseagreen-600",
  "bg-mediumseagreen-700",
];

const brickClasses = [
  "bg-steelblue-100",
  "bg-steelblue-200",
  "bg-steelblue-300",
  "bg-steelblue-400",
  "bg-steelblue-500",
  "bg-steelblue-600",
  "bg-steelblue-700",
];

// 기술명 -> 해당 클래스 배열 매핑
const colorClassesMap: Record<string, string[]> = {
  Solar: solarClasses,
  Wind: windClasses,
  "Non fired soil brick": brickClasses,
};

const Contents: NextPage = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // create 또는 view
  const recordId = searchParams.get("recordid"); // 숫자 형태의 id

  const { country, technology, setCountry, setTechnology } = useSelectedStore();

  const [countries, setCountries] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [valuesMap, setValuesMap] = useState<
    Record<string, Record<string, number>>
  >({});
  const router = useRouter();

  const fetchHeatmapData = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/heatmap`);
      const data = res.data.data;
      // data: [{hc_id, mt_id, nm_hc, nm_mt, value}, ...]

      const cSet = new Set<string>();
      const tSet = new Set<string>();

      for (const row of data) {
        cSet.add(row.nm_hc);
        tSet.add(row.nm_mt);
      }

      const cArray = Array.from(cSet);
      const tArray = Array.from(tSet);

      const vMap: Record<string, Record<string, number>> = {};
      tArray.forEach((t) => {
        vMap[t] = {};
      });
      data.forEach((row: any) => {
        if (!vMap[row.nm_mt]) vMap[row.nm_mt] = {};
        vMap[row.nm_mt][row.nm_hc] = row.value;
      });

      setCountries(cArray);
      setTechnologies(tArray);
      setValuesMap(vMap);
    } catch (err) {
      console.error("Error fetching heatmap data:", err);
    }
  }, []);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  const handleCellClick = (c: string, t: string) => {
    if (mode === "view") return; // view 모드에서는 선택 불가
    setCountry(c);
    setTechnology(t);
  };

  useEffect(() => {
    if (mode === "create") {
      console.log("Create mode - 새로운 계산 로직을 시작합니다.");
    } else if (mode === "view" && recordId) {
      console.log(`View mode - recordid: ${recordId} 로 특정 데이터 조회`);
    } else {
      console.log("기본 상태 - mode가 지정되지 않음");
    }
  }, [mode, recordId]);

  // value를 0~100 사이 값이라 가정하고,
  // 0~10 -> index 0, 11~20 -> index 1 ... 61~70 -> index 6
  // 일단 7단계로 가정: 0~10(0), 11~20(1), 21~30(2), 31~40(3), 41~50(4), 51~60(5), 61~70+(6)
  const getClassByValue = (tech: string, value: number) => {
    const classes = colorClassesMap[tech];
    if (!classes) return "bg-gray-100"; // 해당 기술 색상 없음 시 회색
    // 범위 계산
    let index = Math.floor(value / 10);
    if (index > 6) index = 6; // 70 이상은 최대치로
    return classes[index];
  };

  return (
    <div className="w-full flex justify-center items-center md:pt-20">
      <div className="w-full max-w-[764px] relative rounded-2xl bg-white bg-opacity-[40%] overflow-hidden flex flex-col items-start justify-start p-8 box-border text-left text-sm text-color-text-light font-label-medium-bold">
        {/* Steps */}
        <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-6 gap-2">
          <div className="flex flex-row items-start justify-start gap-px">
            <div className="w-20 rounded-tl-lg bg-color-text-default flex flex-row items-center justify-center p-2 box-border text-color-common-white">
              <b className="relative leading-[16px]">Step 1</b>
            </div>
            <div
              className={`w-20 bg-white bg-opacity-[40%] flex flex-row items-center justify-center p-2 box-border ${
                mode === "create" ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <b className="relative leading-[16px] opacity-[0.5]">Step 2</b>
            </div>
            <div
              className={`w-20 bg-white bg-opacity-[40%] flex flex-row items-center justify-center p-2 box-border rounded-tr-lg ${
                mode === "create" ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <b className="relative leading-[16px] opacity-[0.5]">Finish</b>
            </div>
          </div>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 text-5xl text-black">
            <b className="self-stretch relative leading-[32px]">
              Choose your country and technology
            </b>
            <div className="self-stretch relative text-sm leading-[16px]">
              The heatmap shows the expected carbon reduction for each country
              and technology combination, measured in 10,000 t CO2-eq. Please
              select one to proceed.
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="self-stretch rounded-number-common-radius-sm bg-gray-100 flex flex-col items-start justify-start p-6 gap-1 text-color-text-invert">
          <div className="self-stretch flex flex-row items-center justify-end pt-0 px-0 pb-3 text-black">
            <div className="relative leading-[16px]">Unit 10,000 tCo2-eq</div>
          </div>

          {/* 각 기술별 행 */}
          {technologies.map((tech, tIndex) => (
            <div
              key={tIndex}
              className="self-stretch flex flex-row items-start justify-start gap-1 text-color-text-default whitespace-normal break-words"
            >
              <div className="flex-1 rounded-number-common-radius-tiny h-10 overflow-hidden flex flex-row items-center justify-start px-2">
                <b className="relative leading-[16px] whitespace-normal break-words">
                  {tech}
                </b>
              </div>
              {countries.map((c, cIndex) => {
                const val = valuesMap[tech]?.[c] ?? 0;
                const cellClass = getClassByValue(tech, val);

                return (
                  <div
                    key={cIndex}
                    className={`flex-1 rounded-number-common-radius-tiny h-10 overflow-hidden flex flex-row items-center justify-center ${cellClass}`}
                    style={{
                      cursor: mode === "view" ? "not-allowed" : "pointer",
                    }}
                    onClick={() => handleCellClick(c, tech)}
                  >
                    <div className="relative leading-[16px] text-center">
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* 국가 헤더 */}
          <div className="self-stretch flex flex-row items-start justify-start gap-1 whitespace-normal break-words text-black text-sm text-color-text-default">
            <div className="flex-1 h-10 overflow-hidden flex flex-row items-center justify-start px-2">
              {/* 빈칸 */}
            </div>
            {countries.map((c, idx) => (
              <div
                key={idx}
                className="flex-1 rounded-number-common-radius-tiny h-10 overflow-hidden flex flex-row items-center justify-center"
              >
                <div className="relative leading-[16px] text-center whitespace-normal break-words">
                  {c}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Item */}
        <div className="self-stretch flex flex-col items-start justify-end pt-6 px-0 pb-0 gap-2 text-base text-black">
          <b className="relative leading-[18px]">Selected Item</b>
          <div className="self-stretch flex flex-row items-center justify-between text-sm text-color-text-default">
            <div className="flex flex-row items-center justify-start gap-1">
              <div className="rounded-number-common-radius-full bg-gray-200 h-10 overflow-hidden flex flex-row items-center justify-center py-0 px-5 box-border">
                <div className="relative leading-[16px]">
                  {country || "Not selected"}
                </div>
              </div>
              <div className="rounded-number-common-radius-full bg-gray-200 h-10 overflow-hidden flex flex-row items-center justify-center py-0 px-5 box-border">
                <div className="relative leading-[16px]">
                  {technology || "Not selected"}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                // mode 그대로 전달하면서 다음 단계로 이동
                if (country && technology) {
                  if (mode === "create") {
                    router.push(`/en/calculator/app/step1-b?mode=create`);
                  } else {
                    router.push(
                      `/en/calculator/app/step1-b?mode=view&recordid=${recordId}`
                    );
                  }
                }
              }}
              className="w-40 rounded-981xl [background:linear-gradient(180deg,_#0d5247,_#0a3e36)] flex flex-row items-center justify-center py-2 px-[8px] box-border text-base text-color-common-white cursor-pointer"
            >
              <b className="relative leading-[18px]">Next</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contents;
