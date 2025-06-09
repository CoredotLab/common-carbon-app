"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRecoilValue } from "recoil";
import {
  verifierState, // ▶︎ NEW
  acState,
  hcState,
  mtState,
} from "@/recoil/filterState";
import axios from "axios";

/* ---------- 타입 ---------- */
interface GraphData {
  year: string;
  hydro: number;
  waterPurification: number;
  naturalGas: number;
  cookstove: number;
  solar: number;
  led: number;
  wind: number;
  biomass: number;
  infra: number;
  transportation: number;
}
interface GraphResponse {
  graphData: GraphData[];
  usedTechnologies: string[];
}
enum Technology {
  Hydro = "Hydro",
  WaterPurification = "Water purification",
  NaturalGas = "Natural Gas",
  Cookstove = "Cookstove",
  Solar = "Solar",
  Led = "LED",
  Wind = "Wind",
  Biomass = "Biomass",
  Infra = "Infra",
  Transportation = "Transportation",
}

/* ---------- 색상 맵 ---------- */
const colorMap: Record<string, string> = {
  [Technology.Hydro]: "#8884d8",
  [Technology.WaterPurification]: "#82ca9d",
  [Technology.NaturalGas]: "#ffc658",
  [Technology.Cookstove]: "#D85A8D",
  [Technology.Solar]: "#D88D", // 기존 값 그대로
  [Technology.Led]: "#FF9352",
  [Technology.Wind]: "#fb3a73",
  [Technology.Biomass]: "#247a47",
  [Technology.Infra]: "#c80419",
  [Technology.Transportation]: "#46a2cb",
};

export default function CimGraph() {
  /* ---------- 상태 ---------- */
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [usedTechnologies, setUsedTechnologies] = useState<string[]>([]);

  /* ---------- 필터 값 ---------- */
  const vValue = useRecoilValue(verifierState); // ▶︎ NEW
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);

  /* ---------- 데이터 패치 ---------- */
  const fetchGraphData = useCallback(async () => {
    const params = new URLSearchParams();
    if (vValue !== "All") params.append("verifier", vValue); // ▶︎ NEW
    if (acValue !== "All") params.append("ac", acValue);
    if (hcValue !== "All") params.append("hc", hcValue);
    if (mtValue !== "All") params.append("mt", mtValue);

    try {
      const { data, status } = await axios.get<GraphResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/graph?${params.toString()}`
      );
      if (status === 200) {
        setGraphData(data.graphData);
        setUsedTechnologies(data.usedTechnologies);
      }
    } catch (_) {
      /* 에러 무시 */
    }
  }, [vValue, acValue, hcValue, mtValue]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  /* ---------- 렌더 ---------- */
  return (
    <main className="flex flex-col w-full h-[232px] shrink-0 space-y-[11px]">
      <div className="flex flex-col space-y-[5px]">
        <span className="text-[24px] font-[700]">Overview data</span>
        <span className="text-[11px] font-[500]">
          Performance graph by major carbon reduction technology over the past 5
          years
        </span>
      </div>

      <div className="flex w-full h-full space-x-[10px]">
        {/* ----- 그래프 영역 ----- */}
        <div className="w-full h-full max-h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={graphData}
              margin={{ top: 0, right: 0, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />

              {Object.values(Technology).map((tech) =>
                usedTechnologies.includes(tech) ? (
                  <Area
                    key={tech}
                    type="monotone"
                    dataKey={
                      tech === Technology.WaterPurification
                        ? "waterPurification"
                        : tech.toLowerCase() /* 기존 로직 유지 */
                    }
                    stackId="1"
                    stroke={colorMap[tech]}
                    fill={colorMap[tech]}
                  />
                ) : null
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ----- 범례 영역 ----- */}
        <div className="w-[105px] flex flex-col h-full justify-start leading-[12px]">
          {Object.values(Technology).map((tech) =>
            usedTechnologies.includes(tech) ? (
              <div
                key={tech}
                className="flex space-x-[6px] px-[6px] items-center"
              >
                <div
                  className="w-[8px] h-[8px] rounded-[100px] shrink-0"
                  style={{ backgroundColor: colorMap[tech] }}
                />
                <span className="text-[12px] font-[500]">
                  {tech === Technology.Hydro
                    ? "hydroelectric power"
                    : tech.toLowerCase().replace(" ", "")}
                </span>
              </div>
            ) : null
          )}
        </div>
      </div>
    </main>
  );
}
