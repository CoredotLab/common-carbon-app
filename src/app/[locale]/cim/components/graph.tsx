"use client";
import { use, useEffect, useState } from "react";
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

export default function CimGraph() {
  const [subject, setSubject] = useState(
    "Performance graph by major carbon reduction technology over the past 5 years"
  );
  const [graphData, setGraphData] = useState<GraphData[]>();
  const [usedTechnology, setUsedTechnology] = useState<string[]>([]);
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
        setUsedTechnology(data.usedTechnologies);
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
        {/* graph */}
        <div className="w-full h-full max-h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              width={800}
              height={400}
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
                tick={{
                  fontSize: 10,
                }}
                ticks={["2018", "2020", "2022"]}
              />
              <YAxis
                tick={{
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                }}
              />
              {usedTechnology.includes(Technology.Hydro) && (
                <Area
                  type="monotone"
                  dataKey="hydro"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              )}
              {usedTechnology.includes(Technology.WaterPurification) && (
                <Area
                  type="monotone"
                  dataKey="waterPurification"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              )}
              {usedTechnology.includes(Technology.NaturalGas) && (
                <Area
                  type="monotone"
                  dataKey="naturalGas"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
              )}
              {/* 전부 다른색 */}
              {usedTechnology.includes(Technology.Cookstove) && (
                <Area
                  type="monotone"
                  dataKey="cookstove"
                  stackId="1"
                  stroke="#D85A8D"
                  fill="#D85A8D"
                />
              )}
              {usedTechnology.includes(Technology.Solar) && (
                <Area
                  type="monotone"
                  dataKey="solar"
                  stackId="1"
                  stroke="#D88D"
                  fill="#D88D"
                />
              )}
              {usedTechnology.includes(Technology.Led) && (
                <Area
                  type="monotone"
                  dataKey="led"
                  stackId="1"
                  stroke="#FF9352"
                  fill="#FF9352"
                />
              )}
              {usedTechnology.includes(Technology.Wind) && (
                <Area
                  type="monotone"
                  dataKey="wind"
                  stackId="1"
                  stroke="#fb3a73"
                  fill="#fb3a73"
                />
              )}
              {usedTechnology.includes(Technology.Biomass) && (
                <Area
                  type="monotone"
                  dataKey="biomass"
                  stackId="1"
                  stroke="#247a47"
                  fill="#247a47"
                />
              )}
              {usedTechnology.includes(Technology.Infra) && (
                <Area
                  type="monotone"
                  dataKey="infra"
                  stackId="1"
                  stroke="#c80419"
                  fill="#c80419"
                />
              )}
              {usedTechnology.includes(Technology.Transportation) && (
                <Area
                  type="monotone"
                  dataKey="transportation"
                  stackId="1"
                  stroke="#46a2cb"
                  fill="#46a2cb"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* 색인 */}
        <div className="w-[105px] flex flex-col h-full -space-y-[0px] justify-start shrink-0 leading-[12px]">
          {usedTechnology.includes(Technology.Hydro) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#8884d8] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">
                hydroelectric power
              </span>
            </div>
          )}
          {usedTechnology.includes(Technology.WaterPurification) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#82ca9d] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">water purification</span>
            </div>
          )}
          {usedTechnology.includes(Technology.NaturalGas) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#ffc658] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">natural gas</span>
            </div>
          )}
          {usedTechnology.includes(Technology.Cookstove) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#D85A8D] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">cookstove</span>
            </div>
          )}
          {usedTechnology.includes(Technology.Solar) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#D88D] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">solar</span>
            </div>
          )}
          {usedTechnology.includes(Technology.Led) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#FF9352] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">LED</span>
            </div>
          )}
          {usedTechnology.includes(Technology.Wind) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#fb3a73] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">wind</span>
            </div>
          )}
          {usedTechnology.includes(Technology.Biomass) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#247a47] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">biomass</span>
            </div>
          )}
          {usedTechnology.includes(Technology.Infra) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#c80419] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">infra</span>
            </div>
          )}
          {usedTechnology.includes(Technology.Transportation) && (
            <div className="flex space-x-[6px] px-[6px] items-center">
              <div className="w-[8px] h-[8px] bg-[#46a2cb] rounded-[100px] shrink-0"></div>
              <span className="text-[12px] font-[500]">transportation</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
