// utils/pendingQueue.ts

import { ChatMessage } from "@/app/[locale]/caa/chat/[c]/types/caaTypes";

type PendingItem = {
  convId: number;
  tmpIndex: number; // messages state 상 index
};

const queue: PendingItem[] = [];
let timer: number | null = null;
export const addPending = (item: PendingItem) => {
  queue.push(item);
  if (!timer) startPolling();
};

export const clearQueue = () => {
  queue.length = 0;
};

const startPolling = () => {
  const api = require("@/utils/axios").default(); // lazy
  timer = window.setInterval(async () => {
    // 중복된 convId 도 하나만 호출
    // 중복된 convId 도 하나만 호출
    const byConv = Array.from(new Set(queue.map((q) => q.convId)));
    byConv.map(async (cid) => {
      const { data } = await api.get(`/api/chat_caa/conversations/${cid}`);
      const msgs: ChatMessage[] = data.messages;

      // 마지막 assistant 가 done 이면 bubble 교체
      const lastAsst = [...msgs].reverse().find((m) => m.role === "assistant");
      if (lastAsst?.status === "done") {
        // 대기 중이던 항목들 제거
        const idxArr = queue
          .filter((q) => q.convId === cid)
          .map((q) => q.tmpIndex);

        window.dispatchEvent(
          new CustomEvent("LLM_DONE", {
            detail: { convId: cid, message: lastAsst, idxArr },
          })
        );
        // 큐에서 삭제
        for (let i = queue.length - 1; i >= 0; i--)
          if (queue[i].convId === cid) queue.splice(i, 1);
      }
    });
  }, 2000);
};
