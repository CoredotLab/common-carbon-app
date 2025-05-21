"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import useAxios from "@/utils/axios";
import Image from "next/image";
import { groupSortKey } from "@/utils/dateLabel";
import ConversationItem from "./ConversationItem";

interface ConversationItem {
  conversation_id: number;
  title: string;
  created_at: string; // ISO
  updated_at: string;
}

/* ────────────────────────────────────────────────────────── */
export default function SidebarNav() {
  const api = useAxios();
  const { c: currentIdParam } = useParams<{ c?: string }>();
  const currentId = Number(currentIdParam); // NaN → false

  /* ---------- state ---------- */
  const [groups, setGroups] = useState<Record<string, ConversationItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");

  /* ---------- fetch ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ConversationItem[]>(
          `/api/chat_caa/users/me/conversations`,
          { params: { limit: 50, sort: "updated_desc" } }
        );

        // group by date label
        const g: Record<string, ConversationItem[]> = {};
        for (const conv of data) {
          const d = new Date(conv.created_at);
          let lbl = format(d, "MMMM d, yyyy");
          if (isToday(d)) lbl = "Today";
          else if (isYesterday(d)) lbl = "Yesterday";
          (g[lbl] ||= []).push(conv);
        }
        setGroups(g);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- user info ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });

        if (!res.data.email) return;
        setUserId(res.data.display_name); // 이메일 앞부분만 표시
        setUserName(res.data.display_name);
        setUserPhoto(res.data.photo_url);
      } catch (e) {
        console.error("Failed to fetch user info", e);
      }
    })();
  }, []);

  /* ---------- UI ---------- */
  if (loading)
    return (
      <aside className="w-[280px] p-6 bg-gradient-to-b from-[#e2edff] to-[#f6f6f6]">
        <p className="text-sm animate-pulse">Loading…</p>
      </aside>
    );

  return (
    <aside
      className="flex h-full flex-col w-[280px] py-6 px-4
                      [background:linear-gradient(180deg,_#e2edff,_#f6f6f6)] font-afacad"
    >
      <nav className="flex-1 overflow-y-auto space-y-5 text-sm">
        {Object.entries(groups)
          .sort(
            ([aLabel], [bLabel]) => groupSortKey(aLabel) - groupSortKey(bLabel)
          )
          .map(([label, items]) => (
            <div key={label}>
              <h3 className="font-afacad text-black p-3 font-medium">
                {label}
              </h3>

              <ul>
                {items.map((it) => {
                  const active = it.conversation_id === currentId;
                  return (
                    <li key={it.conversation_id}>
                      <ConversationItem
                        item={it}
                        active={active}
                        /* ── ① 로컬 state 업데이트 콜백 ── */
                        onRenamed={(title) =>
                          setGroups((prev) => {
                            const copy = { ...prev };
                            copy[label] = copy[label].map((c) =>
                              c.conversation_id === it.conversation_id
                                ? { ...c, title }
                                : c
                            );
                            return copy;
                          })
                        }
                        onDeleted={() =>
                          setGroups((prev) => {
                            const copy = { ...prev };
                            copy[label] = copy[label].filter(
                              (c) => c.conversation_id !== it.conversation_id
                            );
                            /* 빈 그룹 제거 */
                            if (!copy[label].length) delete copy[label];
                            return copy;
                          })
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </nav>

      {/* footer – 예시 사용자 정보 */}
      <div className="flex items-center gap-2 text-sm pt-3 border-t">
        <Image
          className="w-[34px] h-[34px] rounded-full"
          src={userPhoto || "/caa/user.svg"}
          alt="user avatar"
          width={34}
          height={34}
        />
        <b>{userId}</b>
      </div>
    </aside>
  );
}
