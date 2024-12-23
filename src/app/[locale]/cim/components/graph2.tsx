"use client";

import { useEffect, useState } from "react";
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
import { acState, hcState, mtState } from "@/recoil/filterState";
import axios from "axios";

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

interface GraphResponse {
  graphData: GraphData[];
  usedTechnologies: string[];
}

const colorMap: Record<string, string> = {
  [Technology.Hydro]: "#8884d8",
  [Technology.WaterPurification]: "#82ca9d",
  [Technology.NaturalGas]: "#ffc658",
  [Technology.Cookstove]: "#D85A8D",
  [Technology.Solar]: "#D88D",
  [Technology.Led]: "#FF9352",
  [Technology.Wind]: "#fb3a73",
  [Technology.Biomass]: "#247a47",
  [Technology.Infra]: "#c80419",
  [Technology.Transportation]: "#46a2cb",
};

export default function CimGraph2() {
  const [subject] = useState(
    "Performance graph by major carbon reduction technology over the past 5 years"
  );
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [usedTechnologies, setUsedTechnologies] = useState<string[]>([]);

  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);

  const requestGraphData = async () => {
    const urlParams = new URLSearchParams();
    if (!acValue.includes("All")) urlParams.append("ac", acValue);
    if (!hcValue.includes("All")) urlParams.append("hc", hcValue);
    if (!mtValue.includes("All")) urlParams.append("mt", mtValue);

    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/graph?${urlParams.toString()}`;

    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const data = response.data as GraphResponse;
        setGraphData(data.graphData);
        setUsedTechnologies(data.usedTechnologies);
      }
    } catch (error) {}
  };

  useEffect(() => {
    requestGraphData();
  }, [acValue, hcValue, mtValue]);

  return (
    <main className="flex flex-col w-full h-[232px] shrink-0 space-y-[11px]">
      <div className="flex flex-col space-y-[5px]">
        <span className="text-[24px] font-[700]">Overview data</span>
        <span className="text-[11px] font-[500]">{subject}</span>
      </div>
      <div className="flex w-full h-full space-x-[10px]">
        <div className="w-full h-full max-h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={graphData}
              margin={{
                top: 0,
                right: 0,
                left: -15,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10 }}
                // 필요하다면 ticks props로 표시하고 싶은 년도를 명시
                // ticks={["2018", "2020", "2022"]}
              />
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
                        : tech.toLowerCase() // tech에 따라 소문자 프로퍼티 변환 필요시 수정
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
                ></div>
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
