"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface GraphData {
  country: string;
  carbonReduction: string;
}

export default function CimTable() {
  const [isOpenedMoreInfo, setIsOpenedMoreInfo] = useState(false);
  const [graphData, setGraphData] = useState<GraphData[]>([
    { country: "Vietnam", carbonReduction: "300,000" },
    { country: "USA", carbonReduction: "1,000" },
    { country: "China", carbonReduction: "500" },
    { country: "Japan", carbonReduction: "200" },
  ]);

  const handleClickedMoreInfo = () => {
    setIsOpenedMoreInfo(!isOpenedMoreInfo);
  };

  useEffect(() => {
    // graphData 무조건 15개로 맞춤
    const tempGraphData = [...graphData];
    while (tempGraphData.length < 15) {
      tempGraphData.push({ country: "", carbonReduction: "" });
    }
    setGraphData(tempGraphData);
  }, []);

  return (
    <main className="flex flex-col w-full min-h-[519px] shrink-0">
      {/* subjects */}
      <span className="py-[10px] text-[12px] font-[700]">
        2023 Global Carbon Reduction Performance Table by Country
      </span>
      {/* table */}
      <table className="w-full flex-1">
        <thead>
          <tr className="text-[12px] font-[700] bg-primary text-white font-[700] text-center">
            <th className="w-[17.5%] border border-r-1 text-start p-[10px]">
              Index
            </th>
            <th className="w-[41.25%] border border-r-1 text-start p-[10px]">
              Country
            </th>
            <th className="w-[41.25%] border border-r-1 text-start p-[10px]">
              Carbon Reduction(tCO2)
            </th>
          </tr>
        </thead>
        <tbody className="text-[12px] font-[400] text-start">
          {/* table 나열, index는 텍스트 가운데 정렬, 짝수 행은 배경 색있음. 무조건 15개 행존재. 데이터 없을 때에는 빈칸으로라도 존재 */}
          {graphData.map((data, index) => (
            <tr
              key={index}
              className={`${index % 2 === 1 ? "bg-[#E6F8F5]" : ""}`}
            >
              {data.country === "" ? (
                <td className="opacity-[0%]">{index + 1}</td>
              ) : (
                <td className="text-center">{index + 1}</td>
              )}
              <td className="pl-[10px]">{data.country}</td>
              <td className="pl-[10px]">{data.carbonReduction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex w-full justify-between bg-[#E6F8F5] border border-t-primary py-[6px] px-[10px] items-center">
        <span className="text-[12px] font-[700]">Total Carbon Reduction</span>
        <div className="text-[#007865]">
          <span className="text-[12px] font-[600]">3,301,000</span>
          <span className="text-[10px] font-[400]"> tCO2 in 2023</span>
        </div>
      </div>
      {/* more info */}
      <button
        onClick={handleClickedMoreInfo}
        className="md:flex hidden w-full justify-end space-x-[10px] items-center"
      >
        <span className="text-primary text-[12px] font-[400]">
          More detail information
        </span>
        <div className="flex w-[24px] h-[24px] py-[6px] px-[2px] justify-center items-center">
          <Image src="/cim/arrow_down.svg" width={10} height={20} alt="more" />
        </div>
      </button>
    </main>
  );
}
