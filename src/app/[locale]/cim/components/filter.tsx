"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  acState,
  hcState,
  mtState,
  openFilterState,
} from "@/recoil/filterState";

interface AC {
  ac_id: number;
  ac_name: string;
}

interface HC {
  hc_id: number;
  hc_name: string;
}

interface MT {
  mt_id: number;
  mt_name: string;
}

interface FilterDropdownProps<T> {
  title: string;
  items: T[];
  value: string;
  onSelect: (val: string) => void;
  open: boolean;
  onToggle: () => void;
  displayKey: keyof T;
}

function FilterDropdown<T extends object>({
  title,
  items,
  value,
  onSelect,
  open,
  onToggle,
  displayKey,
}: FilterDropdownProps<T>) {
  return (
    <div className="flex flex-col space-y-[7px]">
      <span className="text-[16px] font-[500]">{title}</span>
      <div className="relative">
        <button
          onClick={onToggle}
          className="border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex w-[213px] h-[30px] py-[10px] px-[20px] items-center justify-between rounded-[8px]"
        >
          {value || "Select"}
          <Image
            src="/icon_dropdown.svg"
            alt="arrow-down"
            width={18}
            height={18}
          />
        </button>
        {open && (
          <div className="absolute border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] w-[213px] mt-1 rounded-[8px] z-40 overflow-y-auto max-h-[200px] flex flex-col">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-1 hover:bg-gray-200 cursor-pointer px-[20px]"
                onClick={() => onSelect(String(item[displayKey]))}
              >
                {String(item[displayKey])}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Filter() {
  const setAcValue = useSetRecoilState(acState);
  const setHcValue = useSetRecoilState(hcState);
  const setMtValue = useSetRecoilState(mtState);

  const handleReset = () => {
    setAcValue("All");
    setHcValue("All");
    setMtValue("All");
  };

  return (
    <main className="w-full flex flex-col space-y-4">
      <div className="w-full flex md:flex-row flex-col md:space-x-[20px] space-y-[10px] md:space-y-0 md:items-end">
        <AcquiringCountry />
        <HostCountry />
        <MitigationTechnology />
        <button
          onClick={handleReset}
          className="border border-gray-300 bg-white px-4 py-1 rounded-md hover:bg-gray-100 text-sm h-[30px]"
        >
          Reset
        </button>
      </div>
    </main>
  );
}

function AcquiringCountry() {
  const [countries, setCountries] = useState<AC[]>([]);
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);
  const setAcValue = useSetRecoilState(acState);
  const openFilterArr = useRecoilValue(openFilterState);
  const setOpenFilterArr = useSetRecoilState(openFilterState);

  const onToggle = () => setOpenFilterArr([!openFilterArr[0], false, false]);
  const onSelect = (val: string) => {
    setAcValue(val);
    setOpenFilterArr([false, false, false]);
  };

  const requestAC = async () => {
    const params = new URLSearchParams();
    if (hcValue && hcValue !== "All") params.append("hc", hcValue);
    if (mtValue && mtValue !== "All") params.append("mt", mtValue);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/ac${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    try {
      const res = await axios.get(url);
      if (res.status === 200) setCountries(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    requestAC();
  }, [hcValue, mtValue]);

  return (
    <FilterDropdown<AC>
      title="Acquiring country"
      items={countries}
      value={acValue}
      onSelect={onSelect}
      open={openFilterArr[0]}
      onToggle={onToggle}
      displayKey="ac_name"
    />
  );
}

function HostCountry() {
  const [countries, setCountries] = useState<HC[]>([]);
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);
  const setHcValue = useSetRecoilState(hcState);
  const openFilterArr = useRecoilValue(openFilterState);
  const setOpenFilterArr = useSetRecoilState(openFilterState);

  const onToggle = () => setOpenFilterArr([false, !openFilterArr[1], false]);
  const onSelect = (val: string) => {
    setHcValue(val);
    setOpenFilterArr([false, false, false]);
  };

  const requestHC = async () => {
    const params = new URLSearchParams();
    if (acValue && acValue !== "All") params.append("ac", acValue);
    if (mtValue && mtValue !== "All") params.append("mt", mtValue);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/hc${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    try {
      const res = await axios.get(url);
      if (res.status === 200) setCountries(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    requestHC();
  }, [acValue, mtValue]);

  return (
    <FilterDropdown<HC>
      title="Host country"
      items={countries}
      value={hcValue}
      onSelect={onSelect}
      open={openFilterArr[1]}
      onToggle={onToggle}
      displayKey="hc_name"
    />
  );
}

function MitigationTechnology() {
  const [countries, setCountries] = useState<MT[]>([]);
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);
  const setMtValue = useSetRecoilState(mtState);
  const openFilterArr = useRecoilValue(openFilterState);
  const setOpenFilterArr = useSetRecoilState(openFilterState);

  const onToggle = () => setOpenFilterArr([false, false, !openFilterArr[2]]);
  const onSelect = (val: string) => {
    setMtValue(val);
    setOpenFilterArr([false, false, false]);
  };

  const requestMT = async () => {
    const params = new URLSearchParams();
    if (acValue && acValue !== "All") params.append("ac", acValue);
    if (hcValue && hcValue !== "All") params.append("hc", hcValue);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/mt${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    try {
      const res = await axios.get(url);
      if (res.status === 200) setCountries(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    requestMT();
  }, [acValue, hcValue]);

  return (
    <FilterDropdown<MT>
      title="Mitigation technology"
      items={countries}
      value={mtValue}
      onSelect={onSelect}
      open={openFilterArr[2]}
      onToggle={onToggle}
      displayKey="mt_name"
    />
  );
}
