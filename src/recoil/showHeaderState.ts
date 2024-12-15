import { atom } from "recoil";

export const showHeaderState = atom<boolean>({
  key: "showHeaderState",
  default: true,
});
