"use client";

import useSWR from "swr";
import { axiosInstance } from "@/utils/axiosInstance";
import { format, isToday, isYesterday } from "date-fns";
import ConversationItem from "./ConversationItem";
import { groupSortKey } from "@/utils/dateLabel";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Conversation {
  conversation_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

/* ────────────────────────────────────────────────────────── */
export default function SidebarNav() {
  /* 현재 URL 파라미터 & 라우터 */
  const { c: currentIdParam } = useParams<{ c?: string }>();
  const currentId = Number(currentIdParam); // NaN ⇒ false
  const router = useRouter();

  /* ① 대화 목록 */
  const { data, isLoading, mutate } = useSWR<Conversation[]>(
    "/api/chat_caa/users/me/conversations?limit=50&sort=updated_desc"
  );

  /* ② 유저 프로필 */
  const { data: me } = useSWR("/auth/me");

  /* 로딩 스켈레톤 */
  if (isLoading || !data) {
    return (
      <aside className="w-[280px] p-6 bg-gradient-to-b from-[#e2edff] to-[#f6f6f6]">
        <p className="text-sm animate-pulse">Loading…</p>
      </aside>
    );
  }

  /* ③ 날짜별 그룹핑 */
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
                      /* ─ 이름 변경 ─ */
                      onRenamed={async (title) => {
                        try {
                          await axiosInstance.put(
                            `/api/chat_caa/conversations/${it.conversation_id}`,
                            { title }
                          );
                          mutate(
                            (prev) =>
                              prev!.map((c) =>
                                c.conversation_id === it.conversation_id
                                  ? { ...c, title }
                                  : c
                              ),
                            { revalidate: false }
                          );
                        } catch {
                          toast.error("제목 변경 실패");
                        }
                      }}
                      /* ─ 삭제 ─ */
                      onDeleted={async () => {
                        /* 1) Optimistic: 목록에서 즉시 제거 */
                        mutate(
                          (prev) =>
                            prev!.filter(
                              (c) => c.conversation_id !== it.conversation_id
                            ),
                          { revalidate: false }
                        );

                        /* 2) 현재 보고 있던 대화라면 목록 화면으로 이동 */
                        if (it.conversation_id === currentId) {
                          router.push("/en/caa/chat");
                        }

                        /* 3) 서버 요청 */
                        try {
                          await axiosInstance.delete(
                            `/api/chat_caa/conversations/${it.conversation_id}`
                          );
                          // 필요 시 mutate(); 호출해 재검증
                        } catch {
                          // toast.error("삭제 실패");
                          /* 롤백 */
                          mutate(undefined, { revalidate: true });
                        }
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </nav>

      {/* 하단 프로필 */}
      <div className="flex items-center gap-2 text-sm pt-3 border-t">
        <Image
          className="w-[24px] h-[24px] rounded-full"
          src={me?.photo_url || "/caa/user.svg"}
          alt="avatar"
          width={24}
          height={24}
        />
        <b>{me?.display_name}</b>
      </div>
    </aside>
  );
}
