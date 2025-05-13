"use client";
import Image from "next/image";

export const HeaderBtn = ({
  text,
  icon,
  onClick,
  disabled = false,
}: {
  text: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-81xl border border-lightsteelblue h-[34px] px-5 flex items-center gap-2 ${
      disabled ? "opacity-40 cursor-not-allowed" : "bg-white"
    }`}
  >
    <Image src={`/caa/${icon}`} alt="" width={14} height={14} />
    <span className="text-xs leading-none">{text}</span>
  </button>
);
