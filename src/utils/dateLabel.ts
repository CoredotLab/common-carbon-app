// utils/dateLabel.ts (작은 헬퍼로 분리해두면 재사용·테스트 편해요)
import { parse } from "date-fns";

export const groupSortKey = (label: string) => {
  if (label === "Today") return -9999999999999; // ① Today
  if (label === "Yesterday") return -9999999999998; // ② Yesterday

  // ③ 나머지는 날짜 자체를 ― 최신순(내림차)으로
  //    "March 19, 2025" → Date → epoch 뒤집어서 정렬
  const d = parse(label, "MMMM d, yyyy", new Date());
  return -d.getTime(); // getTime() 은 number
};
