"use client";
import { useState } from "react";
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

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

export default function CimGraph() {
  const [subject, setSubject] = useState(
    "Performance graph by major carbon reduction technology over the past 5 years"
  );
  return (
    <main className="flex flex-col w-full h-[232px] shrink-0 space-y-[11px]">
      <div className="flex flex-col space-y-[5px]">
        <span className="text-[24px] font-[700]">Overview data</span>
        <span className="text-[11px] font-[500]">{subject}</span>
      </div>
      <div className="flex w-full h-full space-x-[10px]">
        {/* graph */}
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              width={800}
              height={400}
              data={data}
              margin={{
                top: 0,
                right: 0,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 10,
                }}
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
              <Area
                type="monotone"
                dataKey="uv"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
              />
              <Area
                type="monotone"
                dataKey="pv"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
              />
              <Area
                type="monotone"
                dataKey="amt"
                stackId="1"
                stroke="#ffc658"
                fill="#ffc658"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* 색인 */}
        <div className="w-[105px] flex flex-col h-full space-y-[5px] justify-center shrink-0">
          <div className="flex space-x-[6px] px-[6px] items-center">
            <Image
              src="/cim/circle_yellow.svg"
              width={8}
              height={8}
              alt="graph"
            />
            <span className="text-[12px] font-[500]">solar power</span>
          </div>
          <div className="flex space-x-[6px] px-[6px] items-center">
            <Image
              src="/cim/circle_green.svg"
              width={8}
              height={8}
              alt="graph"
            />
            <span className="text-[12px] font-[500]">hydroelectric power</span>
          </div>
          <div className="flex space-x-[6px] px-[6px] items-center">
            <Image
              src="/cim/circle_purple.svg"
              width={8}
              height={8}
              alt="graph"
            />
            <span className="text-[12px] font-[500]">wind power</span>
          </div>
        </div>
      </div>
    </main>
  );
}
