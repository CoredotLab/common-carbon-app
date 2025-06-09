"use client";

import { useRecoilValue, useSetRecoilState } from "recoil";
import { verifierState, openFilterState } from "@/recoil/filterState";
import FilterDropdown from "./filters/FilterDropdown";

/* 고정 목록 (API로 바꾸려면 여기만 수정) */
const verifierOptions = ["All", "CDM", "VERRA", "GS"];

export default function VerifierSelect() {
  const value = useRecoilValue(verifierState);
  const setValue = useSetRecoilState(verifierState);

  const openArr = useRecoilValue(openFilterState);
  const setOpenArr = useSetRecoilState(openFilterState);

  /* index 3 사용 → [AC, HC, MT, Verifier] */
  const onToggle = () => setOpenArr([false, false, false, !openArr[3]]);
  const onSelect = (val: string) => {
    setValue(val);
    setOpenArr([false, false, false, false]);
  };

  return (
    <FilterDropdown<string>
      title="Verifier"
      items={verifierOptions}
      value={value}
      onSelect={onSelect}
      open={openArr[3]}
      onToggle={onToggle}
      displayKey={undefined as any} /* 문자열 배열이므로 OK */
    />
  );
}
