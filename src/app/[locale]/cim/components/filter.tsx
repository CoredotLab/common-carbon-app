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

export default function Filter() {
  return (
    <main className="w-full flex md:flex-row flex-col md:space-x-[20px] md:space-y-[0px] space-y-[10px]">
      <AcquiringCountry />
      <HostCountry />
      <MitigationTechnology />
    </main>
  );
}

interface AC {
  id: number;
  name: string;
}

function AcquiringCountry() {
  const [countries, setCountries] = useState<AC[]>([]);
  const acValue = useRecoilValue(acState);
  const setAcValue = useSetRecoilState(acState);
  const openFilterValue = useRecoilValue(openFilterState);
  const setOpenFilterValue = useSetRecoilState(openFilterState);

  const toggleDropdown = () => {
    if (openFilterValue[0]) {
      setOpenFilterValue([false, false, false]);
    } else {
      setOpenFilterValue([true, false, false]);
    }
  };

  const handleSelectCountry = (country: string) => {
    setAcValue(country);
    setOpenFilterValue([false, false, false]);
  };

  const requestAC = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/ac`;
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const countries = response.data;
        // add "All" to the beginning of the array
        countries.unshift({ id: 0, name: "All" });
        setCountries(countries);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    requestAC();
  }, []);

  return (
    <main className="flex flex-col space-y-[7px]">
      <span className="text-[16px] font-[500]">(1) Acquiring country</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex w-[213px] h-[30px] py-[10px] px-[20px] items-center justify-between rounded-[8px]"
        >
          {acValue}
          <Image
            src="/icon_dropdown.svg"
            alt="arrow-down"
            width={18}
            height={18}
          />
        </button>
        {openFilterValue[0] && (
          <div className="absolute border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex flex-col w-[213px] mt-1 rounded-[8px] z-40">
            {countries.map((country, index) => (
              <div
                key={index}
                className="p-1 hover:bg-gray-200 cursor-pointer px-[20px] z-40"
                onClick={() => handleSelectCountry(country.name)}
              >
                {country.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

interface HC {
  id: number;
  name: string;
}

function HostCountry() {
  const [countries, setCountries] = useState<HC[]>([]);
  const hcValue = useRecoilValue(hcState);
  const setHcValue = useSetRecoilState(hcState);
  const openFilterValue = useRecoilValue(openFilterState);
  const setOpenFilterValue = useSetRecoilState(openFilterState);

  const toggleDropdown = () => {
    if (openFilterValue[1]) {
      setOpenFilterValue([false, false, false]);
    } else {
      setOpenFilterValue([false, true, false]);
    }
  };

  const handleSelectCountry = (country: string) => {
    setHcValue(country);
    setOpenFilterValue([false, false, false]);
  };

  const requestHC = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/hc`;
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const countries = response.data;
        // add "All" to the beginning of the array
        countries.unshift({ id: 0, name: "All" });
        setCountries(countries);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    requestHC();
  }, []);

  return (
    <main className="flex flex-col space-y-[7px]">
      <span className="text-[16px] font-[500]">(2) Host country</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex w-[213px] h-[30px] py-[10px] px-[20px] items-center justify-between rounded-[8px] z-30"
        >
          {hcValue}
          <Image
            src="/icon_dropdown.svg"
            alt="arrow-down"
            width={18}
            height={18}
          />
        </button>
        {openFilterValue[1] && (
          <div className="absolute border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex flex-col w-[213px] mt-1 rounded-[8px] z-30">
            {countries.map((country, index) => (
              <div
                key={index}
                className="p-1 hover:bg-gray-200 cursor-pointer px-[20px] z-40"
                onClick={() => handleSelectCountry(country.name)}
              >
                {country.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

interface MT {
  id: number;
  name: string;
}

function MitigationTechnology() {
  const [countries, setCountries] = useState<MT[]>([]);
  const openFilterValue = useRecoilValue(openFilterState);
  const setOpenFilterValue = useSetRecoilState(openFilterState);
  const mtValue = useRecoilValue(mtState);
  const setMtValue = useSetRecoilState(mtState);

  const toggleDropdown = () => {
    if (openFilterValue[2]) {
      setOpenFilterValue([false, false, false]);
    } else {
      setOpenFilterValue([false, false, true]);
    }
  };

  const handleSelectCountry = (country: string) => {
    setMtValue(country);
    setOpenFilterValue([false, false, false]);
  };

  const requestMT = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/mt`;
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const countries = response.data;
        // add "All" to the beginning of the array
        countries.unshift({ id: 0, name: "All" });
        setCountries(countries);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    requestMT();
  }, []);

  return (
    <main className="flex flex-col space-y-[7px]">
      <span className="text-[16px] font-[500]">(3) Mitigation technology</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex w-[213px] h-[30px] py-[10px] px-[20px] items-center justify-between rounded-[8px] z-20"
        >
          {mtValue}
          <Image
            src="/icon_dropdown.svg"
            alt="arrow-down"
            width={18}
            height={18}
          />
        </button>
        {openFilterValue[2] && (
          <div className="absolute border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex flex-col w-[213px] mt-1 rounded-[8px] z-20">
            {countries.map((country, index) => (
              <div
                key={index}
                className="p-1 hover:bg-gray-200 cursor-pointer px-[20px]"
                onClick={() => handleSelectCountry(country.name)}
              >
                {country.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
