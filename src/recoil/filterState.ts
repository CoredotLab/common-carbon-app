"use client";
import { atom } from "recoil";

/** ───────── 신규: 검증기관 필터 ───────── */
export const verifierState = atom<string>({
  key: "verifierState",
  default: "All",
});

/** ───────── 기존 3가지 필터 ───────── */
export const acState = atom<string>({
  key: "ac",
  default: "All",
});

export const hcState = atom<string>({
  key: "hc",
  default: "All",
});

export const mtState = atom<string>({
  key: "mt",
  default: "All",
});

/**
 * 각 드롭다운의 열림 상태
 * 인덱스: 0 = Verifier, 1 = HostCountry, 2 = MitigationTech, 3 = 예비
 */
export const openFilterState = atom<boolean[]>({
  key: "openFilterState",
  default: [false, false, false, false],
});

/** ───────── 지도 뷰포트 기반 동적 옵션 ───────── */
export const dynamicAcOptionsState = atom<string[]>({
  key: "dynamicAcOptionsState",
  default: [],
});

export const dynamicHcOptionsState = atom<string[]>({
  key: "dynamicHcOptionsState",
  default: [],
});
