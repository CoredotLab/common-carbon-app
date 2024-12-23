"use client";

import type { NextPage } from "next";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useSelectedStore from "@/store/useSelectedStore";

// 샘플: 미리 정의된 색상 클래스들 (기존)
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
const colorClassesMap: Record<string, string[]> = {
  Solar: solarClasses,
  Wind: windClasses,
  "Non fired soil brick": brickClasses,
};

interface HeatmapData {
  hc_id: number;
  mt_id: number;
  nm_hc: string;
  nm_mt: string;
  value: number;
}

const Step1Heatmap: NextPage = () => {
  // ─────────────────────────────────────────────────────────
  // 1) Query Params
  // ─────────────────────────────────────────────────────────
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "create" | "view"
  // 사용자가 이미 만든 session_id가 있을 수도 있음 (view 모드 or 재접속)
  const sessionIdQuery = searchParams.get("session_id") || "";

  // ─────────────────────────────────────────────────────────
  // 2) Zustand Store: country, technology
  // ─────────────────────────────────────────────────────────
  const { country, technology, setCountry, setTechnology } = useSelectedStore();

  // ─────────────────────────────────────────────────────────
  // 3) Heatmap Data (hc_id, mt_id, value...) + UI
  // ─────────────────────────────────────────────────────────
  const [hitMapDatas, setHitMapDatas] = useState<HeatmapData[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [valuesMap, setValuesMap] = useState<
    Record<string, Record<string, number>>
  >({});

  const router = useRouter();

  // Heatmap fetch
  const fetchHeatmapData = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/heatmap`);
      const data = res.data.data as HeatmapData[];
      setHitMapDatas(data);

      const cSet = new Set<string>();
      const tSet = new Set<string>();
      data.forEach((row) => {
        cSet.add(row.nm_hc);
        tSet.add(row.nm_mt);
      });
      const cArray = Array.from(cSet);
      const tArray = Array.from(tSet);

      // valuesMap[tech][country] = value
      const vMap: Record<string, Record<string, number>> = {};
      tArray.forEach((t) => {
        vMap[t] = {};
      });
      data.forEach((row) => {
        if (!vMap[row.nm_mt]) vMap[row.nm_mt] = {};
        vMap[row.nm_mt][row.nm_hc] = row.value;
      });

      setCountries(cArray);
      setTechnologies(tArray);
      setValuesMap(vMap);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  // ─────────────────────────────────────────────────────────
  // 4) If view mode + sessionId => load existing session info
  // ─────────────────────────────────────────────────────────
  const fetchSessionInfo = useCallback(
    async (sessionIdQuery: string) => {
      try {
        // /calc_session/get_info?session_id=...
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/calc_session/get_info?session_id=${sessionIdQuery}`,
          { withCredentials: true }
        );
        const data = res.data;
        // e.g. {country: "...", technology: "...", scenario_type: "..."}
        // Zustand store에 반영

        setCountry(data.country || "");
        setTechnology(data.technology || "");
      } catch (err) {}
    },
    [setCountry, setTechnology]
  );

  useEffect(() => {
    if (mode === "view" && sessionIdQuery) {
      // 이미 존재하는 session -> 불러오기
      fetchSessionInfo(sessionIdQuery);
    } else if (mode === "create" && sessionIdQuery) {
      // 혹시 create 모드인데도 sessionId가 있으면? => 업데이트 or 새로?
      // 보통은 create면 sessionId가 없을 가능성이 큼
    }
  }, [mode, sessionIdQuery]);

  // ─────────────────────────────────────────────────────────
  // 5) Heatmap Cell Click
  //   - view 모드면 클릭 불가
  //   - create 모드면 setCountry, setTechnology
  // ─────────────────────────────────────────────────────────
  const handleCellClick = (hcName: string, mtName: string) => {
    if (mode === "view") return;
    setCountry(hcName);
    setTechnology(mtName);
  };

  // 클래스 (bg-...) 결정
  const getClassByValue = (techName: string, value: number) => {
    const classes = colorClassesMap[techName];
    if (!classes) return "bg-gray-100";
    let index = Math.floor(value / 10);
    if (index > 6) index = 6;
    return classes[index];
  };

  // ─────────────────────────────────────────────────────────
  // 6) Next Step
  //   - 만약 create + sessionId가 없다면 => /calc_session/new
  //   - 아니면 그냥 step1-b 로 이동
  // ─────────────────────────────────────────────────────────
  const handleNextStep = async () => {
    if (mode === "view") {
      router.push(
        `/en/calculator/app/step1-b?mode=view&session_id=${sessionIdQuery}`
      );
      return;
    }
    if (
      !country ||
      !technology ||
      country === "Not selected" ||
      technology === "Not selected"
    ) {
      alert("Please select country and technology first.");
      return;
    }

    // hc_id, mt_id 찾기
    const hc_id = hitMapDatas.find((d) => d.nm_hc === country)?.hc_id;
    const mt_id = hitMapDatas.find((d) => d.nm_mt === technology)?.mt_id;
    if (!hc_id || !mt_id) {
      alert(
        "Cannot find matching hc_id/mt_id for selected country/technology."
      );
      return;
    }

    if (mode === "create") {
      // sessionIdQuery가 비어있으면 => 새로 만들기
      if (!sessionIdQuery) {
        // create a new session
        try {
          const resp = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/calc_session/new`,
            { hc_id, mt_id },
            { withCredentials: true }
          );
          const newSid = resp.data.session_id;
          localStorage.setItem("calc_session_id", newSid);
          localStorage.setItem("hc_id", hc_id.toString());
          localStorage.setItem("mt_id", mt_id.toString());
          // step1-b
          router.push(
            `/en/calculator/app/step1-b?mode=create&session_id=${newSid}`
          );
        } catch (err) {
          alert("Cannot create new session.");
        }
      } else {
        // 이미 세션이 있다면 => 굳이 new 안 만들고, step1-b로
        router.push(
          `/en/calculator/app/step1-b?mode=create&session_id=${sessionIdQuery}`
        );
      }
    } else {
      // view 모드
      // 여기서는 새 세션 안 만듦, 그냥 기존 sessionIdQuery로 step1-b 이동
      router.push(
        `/en/calculator/app/step1-b?mode=view&session_id=${sessionIdQuery}`
      );
    }
  };

  // ─────────────────────────────────────────────────────────
  // UI RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="w-full flex justify-center items-center md:pt-20">
      <div
        className="w-full max-w-[764px] relative rounded-2xl bg-white bg-opacity-[40%]
        overflow-hidden flex flex-col items-start justify-start p-8 box-border
        text-left text-sm text-color-text-light font-label-medium-bold"
      >
        {/* Steps UI */}
        <div className="self-stretch flex flex-col items-start justify-start pb-6 gap-2">
          {/* Step indicators */}
          <div className="flex flex-row items-start justify-start gap-px">
            <div
              className="w-20 rounded-tl-lg bg-color-text-default
              flex flex-row items-center justify-center p-2
              text-color-common-white"
            >
              <b>Step 1</b>
            </div>
            <button
              className={`w-20 bg-white bg-opacity-[40%]
              flex flex-row items-center justify-center p-2 box-border
              ${mode === "create" ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => {
                if (mode === "create") return;
                router.push(
                  `/en/calculator/app/step2?mode=view&session_id=${sessionIdQuery}`
                );
              }}
            >
              <b className="opacity-[0.5]">Step 2</b>
            </button>
            <button
              className={`w-20 bg-white bg-opacity-[40%]
              flex flex-row items-center justify-center p-2 box-border rounded-tr-lg
              ${mode === "create" ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => {
                if (mode === "create") return;
                router.push(
                  `/en/calculator/app/finish?mode=view&session_id=${sessionIdQuery}`
                );
              }}
            >
              <b className="opacity-[0.5]">Finish</b>
            </button>
          </div>
          <div className="md:text-5xl text-xl text-black">
            <b>Choose your country and technology</b>
          </div>
          <div className="text-sm text-black">
            The heatmap shows the expected carbon reduction for each country and
            technology combination, measured in 10,000 t CO2-eq. Please select
            one to proceed.
          </div>
        </div>

        {/* Heatmap */}
        <div
          className="self-stretch rounded-number-common-radius-sm bg-gray-100
           flex flex-col items-start justify-start p-6 gap-1 text-black"
        >
          <div className="self-stretch flex flex-row items-center justify-end pb-3 text-black">
            <div>Unit 10,000 tCO2-eq</div>
          </div>

          {/* Rows (per technology) */}
          {technologies.map((tech, techIndex) => (
            <div key={techIndex} className="flex flex-row gap-1 w-full">
              {/* Tech Column */}
              <div className="flex-1 h-10 flex items-center justify-start px-2">
                <b>{tech}</b>
              </div>
              {/* Country Columns */}
              {countries.map((cName, cIndex) => {
                const val = valuesMap[tech]?.[cName] || 0;
                const bgClass = getClassByValue(tech, val);

                return (
                  <div
                    key={cIndex}
                    className={`flex-1 h-10 flex items-center justify-center ${bgClass}
                      ${
                        mode === "view"
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    onClick={() => handleCellClick(cName, tech)}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Country header row */}
          <div className="flex flex-row gap-1 w-full text-black text-sm">
            <div className="flex-1 h-10 flex items-center" />
            {countries.map((cName, cIndex) => (
              <div
                key={cIndex}
                className="flex-1 h-10 flex items-center justify-center"
              >
                <span className="hidden md:inline">{cName}</span>
                <span className="inline md:hidden">{cName.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected item & Next button */}
        <div className="self-stretch flex flex-col items-start justify-end pt-6 gap-2 text-base text-black">
          <b>Selected Item</b>
          <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-2 justify-between text-sm text-color-text-default">
            <div className="flex flex-row gap-2">
              <div className="bg-gray-200 h-10 px-5 flex items-center justify-center rounded-full">
                {country || "Not selected"}
              </div>
              <div className="bg-gray-200 h-10 px-5 flex items-center justify-center rounded-full">
                {technology || "Not selected"}
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="md:w-40 w-full rounded-full [background:linear-gradient(180deg,_#0d5247,_#0a3e36)]
                flex items-center justify-center py-2 px-2 text-color-common-white"
            >
              <b>Next</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Heatmap;
