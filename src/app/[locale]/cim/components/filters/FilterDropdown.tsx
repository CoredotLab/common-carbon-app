"use client";
import Image from "next/image";

/* ─── 제네릭 제약 완화 & displayKey 옵션화 ─── */
export interface FilterDropdownProps<T extends object | string> {
  title: string;
  items: T[];
  value: string;
  onSelect: (val: string) => void;
  open: boolean;
  onToggle: () => void;
  /** 문자열 배열 사용 시 undefined 로 두면 됩니다 */
  displayKey?: keyof T;
}

export default function FilterDropdown<T extends object | string>({
  title,
  items,
  value,
  onSelect,
  open,
  onToggle,
  displayKey,
}: FilterDropdownProps<T>) {
  return (
    <div className="flex flex-col space-y-[7px] flex-1 w-full max-w-[200px]">
      <span className="text-[14px] font-[500]">{title}</span>
      <div className="relative">
        <button
          onClick={onToggle}
          className="border border-[#B4B1B1] bg-[#F5F5F5] flex w-full h-9 py-[10px] px-[12px] items-center justify-between rounded-[8px] text-[16px]"
        >
          {value || "Select"}
          <Image
            src="/calculator/icon_arrow_down.svg"
            alt="arrow-down"
            width={12}
            height={6}
          />
        </button>

        {open && (
          <div className="absolute border border-[#B4B1B1] bg-[#F5F5F5] w-full mt-1 rounded-[8px] z-40 overflow-y-auto max-h-[200px] flex flex-col text-[16px]">
            {items.map((item, idx) => {
              const label =
                displayKey !== undefined
                  ? String((item as any)[displayKey])
                  : (item as string);
              return (
                <div
                  key={idx}
                  className="p-1 hover:bg-gray-200 cursor-pointer px-[20px]"
                  onClick={() => onSelect(label)}
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
