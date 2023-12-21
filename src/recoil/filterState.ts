"use client";
import { atom } from "recoil";

export const acState = atom({
  key: "ac",
  default: "All",
});

export const hcState = atom({
  key: "hc",
  default: "All",
});

export const mtState = atom({
  key: "mt",
  default: "All",
});

export const openFilterState = atom({
  key: "openFilterState",
  default: [false, false, false],
});
