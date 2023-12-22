"use client";
import { acState, hcState, mtState } from "@/recoil/filterState";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import axios from "axios";
import { useWindowResize } from "@/hooks/useWindowResize";
import { detailInfoState } from "@/recoil/detailInfoState";

interface RowResponse {
  row: string;
  reduction: number;
}

interface TableResponse {
  subject: string;
  data: object;
}

export default function CimTable() {
  const [tableData, setTableData] = useState<RowResponse[]>([]);
  const [tableSubject, setTableSubject] = useState("Country");
  const [totalReduction, setTotalReduction] = useState(0);
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);
  const innerWidth = useWindowResize();
  const detailInfoValue = useRecoilValue(detailInfoState);
  const setDetailInfoState = useSetRecoilState(detailInfoState);

  const handleClickedMoreInfo = () => {
    setDetailInfoState(!detailInfoValue);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams();
    if (acValue !== "All") urlParams.append("ac", acValue);
    if (hcValue !== "All") urlParams.append("hc", hcValue);
    if (mtValue !== "All") urlParams.append("mt", mtValue);

    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/table?${urlParams.toString()}`;

    const requestTableData = async () => {
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const data = response.data as TableResponse;
          setTableSubject(data.subject);

          // object to array
          const keyArray = Object.keys(data.data);
          const valueArray = Object.values(data.data) as number[];

          const tableData = keyArray.map((key, index) => {
            return { row: key, reduction: valueArray[index] } as RowResponse;
          });

          const sortedTableData = tableData.sort((a, b) => {
            return Number(b.reduction) - Number(a.reduction);
          });

          // innerWidth가 768px 이상이면 최대 15개. 15개 안될경우 빈칸으로 채움
          // innerWidth가 768px 미만이면 최대 15개. 빈칸 안채움.
          const innerWidthOrg = window.innerWidth;
          if (sortedTableData.length > 15) {
            setTableData(sortedTableData.slice(0, 15));
          } else {
            if (innerWidthOrg >= 768) {
              const emptyArray = Array(15 - sortedTableData.length).fill({
                row: "",
                reduction: -1,
              });

              setTableData(sortedTableData.concat(emptyArray));
            } else {
              setTableData(sortedTableData);
            }
          }

          // calculate total reduction
          const totalReduction = valueArray.reduce((a, b) => a + b, 0);
          setTotalReduction(totalReduction);
        }
      } catch (error) {}
    };
    requestTableData();
  }, [acValue, hcValue, mtValue]);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const balanceTableLength = (isMobile: boolean) => {
    if (tableData.length === 0) return;
    if (isMobile) {
      const tempTableData = tableData;
      let lastReduction = tempTableData[tempTableData.length - 1].reduction;
      while (lastReduction === -1) {
        tempTableData.pop();
        lastReduction = tempTableData[tempTableData.length - 1].reduction;
      }
      setTableData(tempTableData);
    } else {
      if (tableData.length > 15) {
        setTableData(tableData.slice(0, 15));
      } else {
        const emptyArray = Array(15 - tableData.length).fill({
          row: "",
          reduction: -1,
        });
        setTableData(tableData.concat(emptyArray));
      }
    }
  };

  useEffect(() => {
    balanceTableLength(innerWidth < 768);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerWidth]);

  return (
    <main className="flex flex-col w-full md:min-h-[519px] shrink-0">
      {/* subjects */}
      <span className="py-[10px] text-[12px] font-[700]">
        Global Carbon Reduction Performance Table
      </span>
      {/* table */}
      <table className="w-full flex-1">
        <thead>
          <tr className="text-[12px] font-[700] bg-primary text-white font-[700] text-center">
            <th className="w-[17.5%] border border-r-1 text-start p-[10px]">
              Index
            </th>
            <th className="w-[41.25%] border border-r-1 text-start p-[10px]">
              {tableSubject}
            </th>
            <th className="w-[41.25%] border border-r-1 text-start p-[10px]">
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
                "h-[24px]" + " " + `${index % 2 === 1 ? "bg-[#E6F8F5]" : ""}`
              }
            >
              {data.row === "" ? (
                <td className="opacity-[0%]">{index + 1}</td>
              ) : (
                <td className="text-center">{index + 1}</td>
              )}
              <td className="pl-[10px]">{data.row}</td>
              <td className="pl-[10px]">
                {data.reduction === -1 ? "" : formatNumber(data.reduction)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex w-full justify-between bg-[#E6F8F5] border border-t-primary py-[6px] px-[10px] items-center">
        <span className="text-[12px] font-[700]">Total Carbon Reduction</span>
        <div className="text-[#007865]">
          <span className="text-[12px] font-[600]">
            {formatNumber(totalReduction)}
          </span>
          <span className="text-[10px] font-[400]"> tCO2</span>
        </div>
      </div>
      {/* more info */}
      <button
        onClick={handleClickedMoreInfo}
        className="md:flex hidden w-full justify-end space-x-[10px] items-center h-[36px]"
      >
        <span className="text-primary text-[12px] font-[400]">
          More detail information
        </span>
        <div className="flex w-[24px] h-[24px] py-[6px] px-[2px] justify-center items-center">
          <Image src="/cim/arrow_down.png" width={10} height={20} alt="more" />
        </div>
      </button>
    </main>
  );
}
