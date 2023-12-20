"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Filter() {
  return (
    <main className="w-full flex md:flex-row flex-col md:space-x-[20px] md:space-y-[0px] space-y-[10px]">
      <AcquiringCountry />
      <HostCountry />
      <MitigationTechnology />
    </main>
  );
}

function AcquiringCountry() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");

  const countries = ["All", "Korea"];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectCountry = (country: React.SetStateAction<string>) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  return (
    <main className="flex flex-col space-y-[7px]">
      <span className="text-[16px] font-[500]">(1) Acquiring country</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex w-[213px] h-[30px] py-[10px] px-[20px] items-center justify-between rounded-[8px]"
        >
          {selectedCountry}
          <Image
            src="/icon_dropdown.svg"
            alt="arrow-down"
            width={18}
            height={18}
          />
        </button>
        {isOpen && (
          <div className="absolute border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex flex-col w-[213px] mt-1 rounded-[8px] z-40">
            {countries.map((country, index) => (
              <div
                key={index}
                className="p-1 hover:bg-gray-200 cursor-pointer px-[20px] z-40"
                onClick={() => handleSelectCountry(country)}
              >
                {country}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function HostCountry() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");

  const countries = ["All", "Korea"];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectCountry = (country: React.SetStateAction<string>) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  return (
    <main className="flex flex-col space-y-[7px]">
      <span className="text-[16px] font-[500]">(2) Host country</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex w-[213px] h-[30px] py-[10px] px-[20px] items-center justify-between rounded-[8px] z-30"
        >
          {selectedCountry}
          <Image
            src="/icon_dropdown.svg"
            alt="arrow-down"
            width={18}
            height={18}
          />
        </button>
        {isOpen && (
          <div className="absolute border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex flex-col w-[213px] mt-1 rounded-[8px] z-30">
            {countries.map((country, index) => (
              <div
                key={index}
                className="p-1 hover:bg-gray-200 cursor-pointer px-[20px] z-40"
                onClick={() => handleSelectCountry(country)}
              >
                {country}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function MitigationTechnology() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");

  const countries = ["All", "Korea"];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectCountry = (country: React.SetStateAction<string>) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  return (
    <main className="flex flex-col space-y-[7px]">
      <span className="text-[16px] font-[500]">(3) Mitigation technology</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex w-[213px] h-[30px] py-[10px] px-[20px] items-center justify-between rounded-[8px] z-20"
        >
          {selectedCountry}
          <Image
            src="/icon_dropdown.svg"
            alt="arrow-down"
            width={18}
            height={18}
          />
        </button>
        {isOpen && (
          <div className="absolute border border-[1px] border-[#B4B1B1] bg-[#F5F5F5] flex flex-col w-[213px] mt-1 rounded-[8px] z-20">
            {countries.map((country, index) => (
              <div
                key={index}
                className="p-1 hover:bg-gray-200 cursor-pointer px-[20px]"
                onClick={() => handleSelectCountry(country)}
              >
                {country}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
