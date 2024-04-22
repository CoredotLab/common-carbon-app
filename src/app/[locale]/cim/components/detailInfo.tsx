"use client";

import { useWindowResize } from "@/hooks/useWindowResize";
import { detailInfoState } from "@/recoil/detailInfoState";
import { acState, hcState, mtState } from "@/recoil/filterState";
import axios from "axios";
import { use, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

interface TableRow {
  ac: string;
  hc: string;
  mt: string;
  projectTitle: string;
  reduction: number;
  company_ac: string;
  company_hc: string;
  methodology: string;
  startDate: string;
  endDate: string;
}

// 이중에서 필요한 내용만 사용
interface TableRowResponse {
  ac: string;
  hc: string;
  mt: string;
  title: string;
  reduction: number;
  company_ac: string;
  company_hc: string;
  methodology: string;
  m_start: string;
  m_end: string;
  id: number;
  lat: number;
  long: number;
}

// 표에 필요한 내용 ac, hc, mt, project title, reduction, company, methodology, startdate, enddate
export default function CimDetailInfo() {
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);
  const innerWidth = useWindowResize();
  const detailInfoValue = useRecoilValue(detailInfoState);
  const setDetailInfoState = useSetRecoilState(detailInfoState);
  const [isShown, setIsShown] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [totalReduction, setTotalReduction] = useState(0);

  useEffect(() => {
    if (detailInfoValue && innerWidth > 768) {
      setIsShown(true);
    } else {
      setIsShown(false);
    }
  }, [detailInfoValue, innerWidth]);

  useEffect(() => {
    if (!isShown) return;
    const urlParams = new URLSearchParams();
    if (!acValue.includes("All")) urlParams.append("ac", acValue);
    if (!hcValue.includes("All")) urlParams.append("hc", hcValue);
    if (!mtValue.includes("All")) urlParams.append("mt", mtValue);

    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/detail_table?${urlParams.toString()}`;

    const requestTableData = async () => {
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const data = response.data as TableRowResponse[];
          const tableData = data.map((row) => {
            return {
              ac: row.ac,
              hc: row.hc,
              mt: row.mt,
              projectTitle: row.title,
              reduction: row.reduction,
              company_ac: row.company_ac,
              company_hc: row.company_hc,
              methodology: row.methodology,
              startDate: row.m_start,
              endDate: row.m_end,
            } as TableRow;
          });
          setTableData(tableData);
          const totalReduction = tableData.reduce((acc, cur) => {
            return acc + cur.reduction;
          }, 0);
          setTotalReduction(totalReduction);
        }
      } catch (error) {}
    };
    requestTableData();
  }, [acValue, hcValue, mtValue, isShown]);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      {isShown && (
        <main className="flex w-full flex-col justify-center items-center">
          <span className="w-full py-[10px] text-[14px] font-[700]">
            Global Carbon Reduction Performance Table ordered by Reduction
          </span>
          {/* table */}
          <table className="w-full text-[12px] font-[400]">
            <thead>
              <tr className="text-[12px] font-[700] bg-primary text-white font-[700] text-center">
                <th className="border border-r-1 text-start p-[10px]">Index</th>
                <th className="border border-r-1 text-start p-[10px]">
                  Acquiring Country
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Host Country
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Mitigation Technology
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Project Title
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Company Name(AC)
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Company Name(HC)
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Methodology
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Start Date
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  End Date
                </th>
                <th className="border border-r-1 text-start p-[10px]">
                  Carbon Reduction(tCO2)
                </th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-[400] text-start">
              {/* table 나열, index는 텍스트 가운데 정렬, 짝수 행은 배경 색있음. 무조건 15개 행존재. 데이터 없을 때에는 빈칸으로라도 존재 */}
              {tableData.map((data, index) => (
                <tr
                  key={index}
                  className={
                    "h-[24px]" +
                    " " +
                    `${index % 2 === 1 ? "bg-[#E6F8F5]" : ""}`
                  }
                >
                  {data.ac === "" ? (
                    <td className="opacity-[0%]">{index + 1}</td>
                  ) : (
                    <td className="text-center">{index + 1}</td>
                  )}
                  <td className="pl-[10px]">{data.ac}</td>
                  <td className="pl-[10px]">{data.hc}</td>
                  <td className="pl-[10px]">{data.mt}</td>
                  <td className="pl-[10px]">{data.projectTitle}</td>
                  <td className="pl-[10px]">{data.company_ac}</td>
                  <td className="pl-[10px]">{data.company_hc}</td>
                  <td className="pl-[10px]">{data.methodology}</td>
                  <td className="pl-[10px]">{data.startDate}</td>
                  <td className="pl-[10px]">{data.endDate}</td>
                  <td className="pl-[10px]">
                    {data.reduction === -1 ? "" : formatNumber(data.reduction)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex w-full justify-between bg-[#E6F8F5] border border-t-primary py-[6px] px-[10px] items-center">
            <span className="text-[12px] font-[700]">
              Total Carbon Reduction
            </span>
            <div className="text-[#007865]">
              <span className="text-[12px] font-[600]">
                {formatNumber(totalReduction)}
              </span>
              <span className="text-[10px] font-[400]"> tCO2</span>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
