"use client";
import { useState, useRef, useEffect, MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import useAxios from "@/utils/axios";
import toast from "react-hot-toast";

interface Props {
  item: { conversation_id: number; title: string };
  active: boolean;
  onRenamed: (title: string) => void;
  onDeleted: () => void;
}

export default function ConversationItem({
  item,
  active,
  onRenamed,
  onDeleted,
}: Props) {
  const api = useAxios();

  /* ------------------------------------------------------------------ */
  /* 팝오버 열림 상태 & ref                                              */
  /* ------------------------------------------------------------------ */
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null); // 팝오버 + 버튼 묶음

  /* 바깥 클릭 or Esc → 닫기 ------------------------------------------ */
  useEffect(() => {
    if (!open) return; // 열렸을 때만 리스너 부착

    const handleClick = (e: MouseEvent | globalThis.MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);
  /* ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ */
  /* rename / delete                                                    */
  /* ------------------------------------------------------------------ */
  const rename = async () => {
    const next = window.prompt("New title", item.title);
    if (!next || next === item.title) return;

    try {
      await api.patch(`/api/chat_caa/conversations/${item.conversation_id}`, {
        title: next,
      });
      onRenamed(next);
      toast.success("Renamed");
    } catch {
      toast.error("Rename failed");
    }
  };

  const remove = async () => {
    if (!confirm("Delete this conversation?")) return;

    try {
      await api.delete(`/api/chat_caa/conversations/${item.conversation_id}`);
      onDeleted();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };
  /* ------------------------------------------------------------------ */

  return (
    <div ref={popRef} className="relative group">
      {/* 링크 */}
      <Link
        href={`/en/caa/chat/${item.conversation_id}`}
        className={`block rounded-lg p-3 truncate ${
          active ? "bg-white shadow-sm" : ""
        }`}
      >
        {item.title || "(untitled)"}
      </Link>

      {/* ⋯ 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute right-1 top-1 p-1 hidden group-hover:block"
      >
        <Image src="/caa/icon_more.svg" width={16} height={16} alt="more" />
      </button>

      {/* 팝오버 */}
      {open && (
        <div
          className="absolute right-0 top-7 z-30 w-32 rounded-md bg-white shadow-lg border
                     text-sm"
        >
          <button
            onClick={() => {
              setOpen(false);
              rename();
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            Rename
          </button>
          <button
            onClick={() => {
              setOpen(false);
              remove();
            }}
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
