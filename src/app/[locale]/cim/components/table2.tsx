"use client";

import { acState, hcState, mtState } from "@/recoil/filterState";
import { detailInfoState } from "@/recoil/detailInfoState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useWindowResize } from "@/hooks/useWindowResize";

interface RowResponse {
  row: string;
  reduction: number;
}

interface TableResponse {
  subject: string;
  data: RowResponse[];
}

export default function CimTable2() {
  const [tableData, setTableData] = useState<RowResponse[]>([]);
  const [tableSubject, setTableSubject] = useState("Country");
  const [totalReduction, setTotalReduction] = useState(0);

  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);
  const detailInfoValue = useRecoilValue(detailInfoState);
  const setDetailInfoState = useSetRecoilState(detailInfoState);

  const innerWidth = useWindowResize();

  const formatNumber = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleMoreInfoClick = () => {
    setDetailInfoState(!detailInfoValue);
  };

  const updateTableData = (
    originalData: RowResponse[],
    screenWidth: number
  ) => {
    let processedData = [...originalData];

    if (originalData.length > 10) {
      processedData = originalData.slice(0, 10);
    } else if (screenWidth >= 768 && originalData.length < 10) {
      const emptyRows = Array(10 - originalData.length).fill({
        row: "",
        reduction: -1,
      });
      processedData = processedData.concat(emptyRows);
    }

    setTableData(processedData);

    const total = originalData.reduce((acc, cur) => acc + cur.reduction, 0);
    setTotalReduction(total);
  };

  useEffect(() => {
    const fetchTableData = async () => {
      const urlParams = new URLSearchParams();
      if (!acValue.includes("All")) urlParams.append("ac", acValue);
      if (!hcValue.includes("All")) urlParams.append("hc", hcValue);
      if (!mtValue.includes("All")) urlParams.append("mt", mtValue);

      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/table?${urlParams.toString()}`;

      try {
        const response = await axios.get<TableResponse>(url);
        if (response.status === 200) {
          const { subject, data } = response.data;
          setTableSubject(subject);
          updateTableData(data, window.innerWidth);
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };
    fetchTableData();
  }, [acValue, hcValue, mtValue]);

  useEffect(() => {
    if (tableData.length > 0) {
      updateTableData(
        tableData.filter((d) => d.reduction !== -1),
        innerWidth
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerWidth]);

  return (
    <div className="w-full relative overflow-hidden flex flex-col items-start justify-start gap-0.5 text-left text-xs text-color-text-default font-body-tiny">
      {/* Title */}
      <div className="text-base font-bold mb-2">
        Global Carbon Reduction Performance Table
      </div>

      {/* Header Row */}
      <div className="self-stretch rounded-number-common-radius-sm bg-gray-200 overflow-hidden flex flex-row items-start justify-start text-[12px]">
        <div className="self-stretch w-16 border-gray-500 border-opacity-[10%] border-r-[1px] border-solid flex flex-row items-center justify-center py-2 px-3 text-center">
          <b className="flex-1 leading-[14px]">Index</b>
        </div>
        <div className="self-stretch flex-1 border-gray-500 border-opacity-[10%] border-r-[1px] border-solid flex flex-row items-center justify-center py-2 px-3">
          <b className="flex-1 leading-[14px]">{tableSubject}</b>
        </div>
        <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
          <b className="flex-1 leading-[14px]">
            <p className="m-0">Carbon Reduction</p>
            <p className="m-0">(tCO2)</p>
          </b>
        </div>
      </div>

      {/* Data Rows */}
      {tableData.map((data, index) => {
        const isEvenRow = index % 2 === 1;
        const rowBg =
          data.row === "" ? "" : isEvenRow ? "bg-white bg-opacity-[40%]" : "";
        return (
          <div
            key={index}
            className={`self-stretch rounded-number-common-radius-sm overflow-hidden flex flex-row items-start justify-start ${rowBg}`}
          >
            <div className="self-stretch w-16 flex flex-row items-center justify-center py-2 px-3 box-border text-center">
              <div className="flex-1 leading-[14px]">
                {data.row === "" ? "" : index + 1}
              </div>
            </div>
            <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
              <div className="flex-1 leading-[14px]">{data.row}</div>
            </div>
            <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
              <div className="flex-1 leading-[14px]">
                {data.reduction === -1 ? "" : formatNumber(data.reduction)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Carbon Reduction Row */}
      <div className="self-stretch rounded-number-common-radius-sm bg-white bg-opacity-[40%] overflow-hidden flex flex-row items-start justify-start">
        <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3">
          <b className="flex-1 leading-[14px]">Total Carbon Reduction</b>
        </div>
        <div className="self-stretch flex-1 flex flex-row items-center justify-center py-2 px-3 text-right text-color-common-primary">
          <div className="flex-1 leading-[14px]">
            <b>{formatNumber(totalReduction)}</b>
            <span> tCO2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
