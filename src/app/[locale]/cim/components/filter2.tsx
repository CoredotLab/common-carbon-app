"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import {
  verifierState,
  acState,
  hcState,
  mtState,
  openFilterState,
} from "@/recoil/filterState";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import FilterDropdown from "./filters/FilterDropdown";
import VerifierSelect from "./VerifierSelect";

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

/* ---------- 메인 ---------- */
export default function Filter2() {
  const setVerifier = useSetRecoilState(verifierState);
  const setAc = useSetRecoilState(acState);
  const setHc = useSetRecoilState(hcState);
  const setMt = useSetRecoilState(mtState);

  const handleReset = () => {
    setVerifier("All");
    setAc("All");
    setHc("All");
    setMt("All");
  };

  return (
    <main className="w-full flex flex-col space-y-2 items-center border-b border-[#1C211F]/10 pb-4">
      <div className="w-full flex md:flex-row flex-col md:space-x-5 space-y-2 md:space-y-0 md:items-end items-center pt-4">
        {/* index 0 */} <AcquiringCountry />
        {/* index 1 */} <HostCountry />
        {/* index 2 */} <MitigationTechnology />
        {/* index 3 */} <VerifierSelect />
        <button onClick={handleReset}>
          <Image
            src="/calculator/icon_refresh.svg"
            alt="reset"
            width={24}
            height={24}
            style={{ filter: "brightness(0)" }}
          />
        </button>
      </div>
    </main>
  );
}

/* ---------- Acquiring Country (index 0) ---------- */
function AcquiringCountry() {
  const [countries, setCountries] = useState<AC[]>([]);
  const ac = useRecoilValue(acState);
  const hc = useRecoilValue(hcState);
  const mt = useRecoilValue(mtState);
  const verifier = useRecoilValue(verifierState);

  const setAc = useSetRecoilState(acState);
  const [openArr, setOpenArr] = useRecoilState(openFilterState);

  const onToggle = () => setOpenArr([!openArr[0], false, false, false]);
  const onSelect = (val: string) => {
    setAc(val);
    setOpenArr([false, false, false, false]);
  };

  useEffect(() => {
    const p = new URLSearchParams();
    if (verifier !== "All") p.append("verifier", verifier);
    if (hc !== "All") p.append("hc", hc);
    if (mt !== "All") p.append("mt", mt);

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/ac${p.toString() ? `?${p}` : ""}`
      )
      .then(({ data, status }) => status === 200 && setCountries(data))
      .catch(() => {});
  }, [verifier, hc, mt]);

  return (
    <FilterDropdown<AC>
      title="Acquiring country"
      items={countries}
      value={ac}
      onSelect={onSelect}
      open={openArr[0]}
      onToggle={onToggle}
      displayKey="ac_name"
    />
  );
}

/* ---------- Host Country (index 1) ---------- */
function HostCountry() {
  const [countries, setCountries] = useState<HC[]>([]);
  const verifier = useRecoilValue(verifierState);
  const ac = useRecoilValue(acState);
  const mt = useRecoilValue(mtState);

  const setHc = useSetRecoilState(hcState);
  const [openArr, setOpenArr] = useRecoilState(openFilterState);

  const onToggle = () => setOpenArr([false, !openArr[1], false, false]);
  const onSelect = (val: string) => {
    setHc(val);
    setOpenArr([false, false, false, false]);
  };

  useEffect(() => {
    const p = new URLSearchParams();
    if (verifier !== "All") p.append("verifier", verifier);
    if (ac !== "All") p.append("ac", ac);
    if (mt !== "All") p.append("mt", mt);

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/hc${p.toString() ? `?${p}` : ""}`
      )
      .then(({ data, status }) => status === 200 && setCountries(data))
      .catch(() => {});
  }, [verifier, ac, mt]);

  return (
    <FilterDropdown<HC>
      title="Host country"
      items={countries}
      value={useRecoilValue(hcState)}
      onSelect={onSelect}
      open={openArr[1]}
      onToggle={onToggle}
      displayKey="hc_name"
    />
  );
}

/* ---------- Mitigation Tech (index 2) ---------- */
function MitigationTechnology() {
  const [techs, setTechs] = useState<MT[]>([]);
  const verifier = useRecoilValue(verifierState);
  const ac = useRecoilValue(acState);
  const hc = useRecoilValue(hcState);

  const setMt = useSetRecoilState(mtState);
  const [openArr, setOpenArr] = useRecoilState(openFilterState);

  const onToggle = () => setOpenArr([false, false, !openArr[2], false]);
  const onSelect = (val: string) => {
    setMt(val);
    setOpenArr([false, false, false, false]);
  };

  useEffect(() => {
    const p = new URLSearchParams();
    if (verifier !== "All") p.append("verifier", verifier);
    if (ac !== "All") p.append("ac", ac);
    if (hc !== "All") p.append("hc", hc);

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/mt${p.toString() ? `?${p}` : ""}`
      )
      .then(({ data, status }) => status === 200 && setTechs(data))
      .catch(() => {});
  }, [verifier, ac, hc]);

  return (
    <FilterDropdown<MT>
      title="Mitigation technology"
      items={techs}
      value={useRecoilValue(mtState)}
      onSelect={onSelect}
      open={openArr[2]}
      onToggle={onToggle}
      displayKey="mt_name"
    />
  );
}
