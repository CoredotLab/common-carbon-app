"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import useAxios from "@/utils/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import { ReactionBtn } from "./components/ReactionBtn";
import { HeaderBtn } from "./components/HeaderBtn";
import { BubbleProps, ChatMessage, Rating } from "./types/caaTypes";
import { ThinkingDots } from "./components/ThinkingDots";
import { downloadBlob } from "@/utils/file";
import {
  ConsultModal,
  FeedbackModal,
} from "./components/ConsultOrFeedbackModal";

export default function ChatPage({ params }: { params: { c: string } }) {
  /* ---------------- state ---------------- */
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [openConsult, setOpenConsult] = useState(false);
  const [openGlobalFb, setOpenGlobalFb] = useState(false);

  /* ---------------- hooks ---------------- */
  const api = useAxios();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.c === "new" ? null : Number(params.c);
  const promptQS = searchParams.get("prompt") ?? "";

  /* ---------------- helpers ---------------- */
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  /* ---------- ① 새 챗 시작 (prompt QS) ---------- */
  useEffect(() => {
    if (params.c !== "new" || !promptQS) return;
    createConversation(promptQS);
  }, [params.c, promptQS]);

  /* ---------- ② 기존 챗 로딩 ---------- */
  /* ---------- ② 기존 챗 로딩 ---------- */
  useEffect(() => {
    if (!id || params.c === "new") return;

    let pollId: number | null = null; // ← interval 핸들러

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/chat_caa/conversations/${id}`);

        setConversationId(data.conversation_id);

        // 1) 메시지 → state
        setMessages(
          data.messages.map((m: any) => ({
            messageId: m.message_id,
            role: m.role,
            content: m.content,
            rating: m.rating,
            status: m.status, // ✔︎ pending / done
            sources: m.sources,
            relatedQuestions:
              m.role === "assistant" ? data.last_related_questions : undefined,
            thinking: m.role === "assistant" && m.status === "pending",
          }))
        );

        // 2) assistant 가 아직 pending 이면 2-초 간격 폴링 시작
        const isPending = data.messages.some(
          (m: any) => m.role === "assistant" && m.status === "pending"
        );

        if (isPending) {
          pollId = window.setInterval(async () => {
            try {
              const { data: p } = await api.get(
                `/api/chat_caa/conversations/${id}`
              );

              const last = [...p.messages]
                .reverse()
                .find((m: any) => m.role === "assistant");

              if (last && last.status === "done") {
                // placeholder(bub.status===pending) 제거 후 실제 답변 삽입
                setMessages((prev) => {
                  const cleaned = prev.filter(
                    (m) => !(m.role === "assistant" && m.status === "pending")
                  );
                  return [
                    ...cleaned,
                    {
                      messageId: last.message_id,
                      role: "assistant",
                      content: last.content,
                      rating: last.rating,
                      status: "done",
                      sources: last.sources,
                      relatedQuestions: p.last_related_questions,
                    },
                  ];
                });
                window.clearInterval(pollId!);
              }
            } catch (e) {
              console.error("polling error ⇒ stop", e);
              clearInterval(pollId!);
            }
          }, 2000);
        }
      } catch {
        alert("대화 불러오기에 실패했습니다.");
        router.replace("/en/caa");
      } finally {
        setLoading(false);
      }
    })();

    // ─ cleanup ───────────────────────────────
    return () => {
      if (pollId) clearInterval(pollId);
    };
  }, [id]);

  /* ======================================================================== */
  /* -------------------------  메시지 전송 로직  --------------------------- */
  /* ======================================================================== */

  /** 새 Conversation 개설 + 첫 질문 */
  const createConversation = async (text: string) => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/chat_caa/conversations", {
        title: text.slice(0, 50),
        initial_message: text,
      });

      setConversationId(data.conversation_id);
      setMessages([
        {
          role: "assistant",
          messageId: data.assistant_msg_id ?? 0,
          content: data.assistant_reply,
          status: data.status,
          rating: "none",
          sources: data.sources,
          relatedQuestions: data.related_questions,
        },
      ]);

      router.replace(`/en/caa/chat/${data.conversation_id}`);
    } catch (e: any) {
      alert(e.response?.data?.detail ?? "대화를 생성할 수 없습니다.");
      router.replace("/en/caa");
    } finally {
      setLoading(false);
    }
  };

  /** 기존 대화에 메시지 추가 */
  const addMessage = async (text: string) => {
    if (!conversationId) return;

    /* 1) 화면에 플레이스홀더 추가 ------------------------------------ */
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, rating: "none" },
      {
        role: "assistant",
        content: "Thinking…",
        status: "pending",
        rating: "none",
        thinking: true,
      },
    ]);

    try {
      const { data } = await api.post(
        `/api/chat_caa/conversations/${conversationId}/messages`,
        { content: text }
      );

      /* 2) 기존 플레이스홀더 교체 & 이전 assistant 의 Related Q 삭제 ---- */
      setMessages((prev) => {
        const withoutPrevRQ = prev.map((m) =>
          m.role === "assistant" ? { ...m, relatedQuestions: undefined } : m
        );
        // 플홀은 마지막 index
        return withoutPrevRQ.slice(0, -1).concat({
          role: "assistant",
          messageId: data.assistant_msg_id,
          content: data.assistant_reply,
          rating: "none",
          sources: data.sources,
          relatedQuestions: data.related_questions,
        });
      });
    } catch (e: any) {
      const msg = e.response?.data?.detail ?? "메시지 전송 실패";
      toast.error(msg);
      // 실패 시 플홀 제거
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  /** send 버튼 핸들러 */
  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || sending) return;

    setInput("");
    setSending(true);

    if (conversationId === null) await createConversation(userText);
    else await addMessage(userText);

    setSending(false);
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ======================================================================== */
  /* -------------------------  UI  --------------------------- */
  /* ======================================================================== */

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <span className="ml-3">Loading chat…</span>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen flex flex-col bg-white">
        {/* 헤더 */}
        <header
          className="w-full h-16 flex items-center justify-between px-4
             sticky top-0 z-30 bg-white/90 backdrop-blur shadow-sm"
        >
          <Image src="/caa/logo.svg" alt="logo" width={180} height={16} />
          <div className="flex gap-1">
            <HeaderBtn
              text="Download Chat"
              icon="icon_download.svg"
              disabled={!conversationId || sending}
              onClick={async () => {
                if (!conversationId) return;
                try {
                  toast.loading("Generating PDF…", { id: "pdf" });

                  // ✅ api 인스턴스 사용 → 쿠키 자동 포함
                  const { data, headers } = await api.get(
                    `/api/chat_caa/conversations/${conversationId}/download`,
                    { responseType: "blob" } // ← 꼭 blob
                  );

                  // 서버가 보내준 파일명 우선 사용
                  const disposition = headers["content-disposition"] ?? "";
                  const match = disposition.match(/filename="?([^"]+)"?/);
                  const filename =
                    (match && match[1]) || `conversation_${conversationId}.pdf`;

                  downloadBlob(data, filename);
                  toast.success("Download complete", { id: "pdf" });
                } catch (e) {
                  toast.error("PDF 생성 실패", { id: "pdf" });
                  console.error(e);
                }
              }}
            />
            <HeaderBtn
              text="Request Consultation"
              icon="icon_request.svg"
              onClick={() => setOpenConsult(true)}
              disabled={!conversationId}
            />
            <HeaderBtn
              text="New Chat"
              icon="icon_new.svg"
              onClick={() => router.push("/en/caa/chat")}
            />
          </div>
        </header>

        {/* 메시지 영역 */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-[800px] flex flex-col gap-6 p-4">
            {messages.map((m, i) => (
              <ChatBubble
                key={i}
                message={m}
                conversationId={conversationId}
                onRatingChange={(r) =>
                  setMessages((prev) =>
                    prev.map((msg, idx) =>
                      idx === i ? { ...msg, rating: r } : msg
                    )
                  )
                }
                onQuickSend={(q) => handleSend(q)}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* 입력창 */}
        <footer className="w-full flex flex-col items-center px-2 pt-2 pb-10 gap-4">
          <div className="max-w-[800px] w-full flex items-center bg-aliceblue border border-lightsteelblue rounded-[22px] px-4 h-11">
            <input
              className="flex-1 bg-transparent outline-none"
              placeholder="Ask anything about sustainability or methods…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onEnter}
              disabled={sending}
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="w-11 h-11 flex items-center justify-center"
            >
              <Image
                src={
                  input.trim()
                    ? "/caa/icon_send_active.svg"
                    : "/caa/icon_send.svg"
                }
                alt="send"
                width={22}
                height={19}
              />
            </button>
          </div>
          <button
            onClick={() => setOpenGlobalFb(true)}
            className="relative w-full max-w-[800px] flex flex-row items-start justify-start gap-1 text-left text-typography-body-body-tiny text-royalblue font-Body-Tiny"
          >
            <Image
              className="w-[15px] relative max-h-full"
              width={15}
              height={15}
              alt=""
              src="/caa/icon_feedback.svg"
            />
            <div className="relative leading-typography-body-body-tiny-lineHeight font-afacad">
              This is a beta version. your feedback helps us improve the
              experience.
            </div>
          </button>
        </footer>
      </div>
      {conversationId && (
        <>
          <ConsultModal
            open={openConsult}
            onClose={() => setOpenConsult(false)}
            conversationId={conversationId}
          />

          {/* 전체 페이지용 피드백 모달 */}
          <FeedbackModal
            open={openGlobalFb}
            onClose={() => setOpenGlobalFb(false)}
            conversationId={conversationId}
          />
        </>
      )}
    </>
  );
}

/* ======================================================================== */
/* -------------------------  components  --------------------------- */
/* ======================================================================== */

const ChatBubble = ({
  message,
  conversationId,
  onRatingChange,
  onQuickSend,
}: BubbleProps) => {
  const isUser = message.role === "user";
  const api = useAxios();

  /* -------- 좋아요 / 싫어요 처리 -------- */
  const updateRating = async (next: Rating) => {
    if (!conversationId || !message.messageId || message.thinking) return;
    try {
      if (next === message.rating) next = "none";
      await api.post(
        `/api/chat_caa/conversations/${conversationId}/messages/${message.messageId}/feedback`,
        { rating: next }
      );
      onRatingChange(next);
    } catch {
      toast.error("피드백 전송 실패");
    }
  };

  /* -------- 컨텐츠 렌더 -------- */
  const renderContent = () => {
    if (isUser) {
      return (
        <p className="whitespace-pre-line leading-[26px] text-sm">
          {message.content}
        </p>
      );
    }

    if (message.thinking || message.status === "pending") {
      return <ThinkingDots />;
    }

    const safeHtml = DOMPurify.sanitize(message.content);
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="leading-[26px] text-sm whitespace-pre-wrap">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
        }}
      >
        {safeHtml}
      </ReactMarkdown>
    );
  };

  /* -------- JSX -------- */
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`${
          isUser ? "bg-aliceblue" : ""
        } rounded-2xl p-4 max-w-[640px]`}
      >
        {/* 출처 */}
        {!isUser &&
          !message.thinking &&
          message.sources &&
          message.sources.length > 0 && (
            <div className="flex items-center gap-2 mb-2 opacity-50 text-xs">
              <span>source</span>
              <div className="flex gap-1 flex-wrap">
                {message.sources?.map((s, i) => (
                  <a
                    key={i}
                    href={s.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-81xl bg-whitesmoke px-2 py-1 hover:underline"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

        {/* 본문 */}
        {renderContent()}

        {/* ReactionBar */}
        {!isUser && !message.thinking && (
          <div className="flex gap-2 mt-2">
            <ReactionBtn
              icon="icon_thumb_up.svg"
              active={message.rating === "like"}
              onClick={() => updateRating("like")}
            />
            <ReactionBtn
              icon="icon_thumb_down.svg"
              active={message.rating === "dislike"}
              onClick={() => updateRating("dislike")}
            />
            <ReactionBtn
              icon="icon_copy.svg"
              onClick={() => {
                navigator.clipboard.writeText(message.content);
                toast.success("Copied to clipboard");
              }}
            />
          </div>
        )}

        {/* Related Questions : 항상 ‘마지막 assistant’에게만 존재 */}
        {!isUser &&
          !message.thinking &&
          message.relatedQuestions &&
          message.relatedQuestions.length > 0 && (
            <div className="mt-4 border-t border-common-line pt-3">
              <h4 className="font-bold mb-2">Related Questions</h4>
              {message.relatedQuestions.map((q, i) => (
                <button
                  key={i}
                  className="w-full flex justify-between items-center py-3 border-b border-common-line text-left hover:bg-gray-50"
                  onClick={() => onQuickSend(q)}
                >
                  <span className="flex-1 text-sm">{q}</span>
                  <Image
                    src="/caa/icon_plus.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};
