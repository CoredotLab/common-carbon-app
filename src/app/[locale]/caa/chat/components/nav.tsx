"use client";

import useSWR from "swr";
import { axiosInstance } from "@/utils/axiosInstance"; // POST 등에 재사용
import { format, isToday, isYesterday } from "date-fns";
import ConversationItem from "./ConversationItem";
import { groupSortKey } from "@/utils/dateLabel";
import Image from "next/image";
import { useParams } from "next/navigation";

interface Conversation {
  conversation_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

/* ────────────────────────────────────────────────────────── */
export default function SidebarNav() {
  const { c: currentIdParam } = useParams<{ c?: string }>();
  const currentId = Number(currentIdParam); // NaN ⇒ false

  /* ---------- ① 대화 목록 ---------- */
  const { data, isLoading, mutate } = useSWR<Conversation[]>(
    "/api/chat_caa/users/me/conversations?limit=50&sort=updated_desc"
  );

  /* ---------- ② 유저 프로필 ---------- */
  const { data: me } = useSWR("/auth/me");

  if (isLoading || !data)
    return (
      <aside className="w-[280px] p-6 bg-gradient-to-b from-[#e2edff] to-[#f6f6f6]">
        <p className="text-sm animate-pulse">Loading…</p>
      </aside>
    );

  /* ---------- group by 날짜 ---------- */
  const groups: Record<string, Conversation[]> = {};
  for (const conv of data) {
    const d = new Date(conv.created_at);
    let lbl = format(d, "MMMM d, yyyy");
    if (isToday(d)) lbl = "Today";
    else if (isYesterday(d)) lbl = "Yesterday";
    (groups[lbl] ||= []).push(conv);
  }

  return (
    <aside
      className="flex h-full flex-col w-[280px] py-6 px-4
           [background:linear-gradient(180deg,_#e2edff,_#f6f6f6)] font-afacad"
    >
      <nav className="flex-1 overflow-y-auto space-y-5 text-sm">
        {Object.entries(groups)
          .sort(([a], [b]) => groupSortKey(a) - groupSortKey(b))
          .map(([label, items]) => (
            <div key={label}>
              <h3 className="p-3 font-medium">{label}</h3>
              <ul>
                {items.map((it) => (
                  <li key={it.conversation_id}>
                    <ConversationItem
                      item={it}
                      active={it.conversation_id === currentId}
                      /* === 변경 콜백 === */
                      onRenamed={(title) => {
                        // 1) 서버 PATCH
                        axiosInstance.put(
                          `/api/chat_caa/conversations/${it.conversation_id}`,
                          { title }
                        );
                        // 2) 로컬 캐시 갱신
                        mutate(
                          (prev) =>
                            prev!.map((c) =>
                              c.conversation_id === it.conversation_id
                                ? { ...c, title }
                                : c
                            ),
                          { revalidate: false }
                        );
                      }}
                      onDeleted={async () => {
                        await axiosInstance.delete(
                          `/api/chat_caa/conversations/${it.conversation_id}`
                        );
                        mutate(); // 서버 재호출 or optimistic update 가능
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </nav>

      <div className="flex items-center gap-2 text-sm pt-3 border-t">
        <Image
          className="w-[34px] h-[34px] rounded-full"
          src={me?.photo_url || "/caa/user.svg"}
          alt="avatar"
          width={34}
          height={34}
        />
        <b>{me?.display_name}</b>
      </div>
    </aside>
  );
}
