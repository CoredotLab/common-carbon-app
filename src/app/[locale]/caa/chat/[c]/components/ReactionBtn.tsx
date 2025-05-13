"use client";
import Image from "next/image";

/* Reaction icon 버튼 */
export const ReactionBtn = ({
  icon,
  active = false,
  onClick,
}: {
  icon: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-11 h-11 rounded-[22px] flex items-center justify-center ${
      active ? "bg-[#567de8]" : "bg-[#ebf3ff]"
    }`}
  >
    <Image
      src={`/caa/${icon}`}
      alt=""
      width={16}
      height={14}
      className={active ? "filter brightness-0 invert" : ""}
    />
  </button>
);
