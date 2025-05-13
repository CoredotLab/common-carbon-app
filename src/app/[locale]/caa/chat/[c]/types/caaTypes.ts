/* ---------------- types ---------------- */
export type Rating = "none" | "like" | "dislike";

export interface ChatMessage {
  messageId?: number; // assistant 메시지 PK
  role: "user" | "assistant";
  content: string;
  rating: Rating;
  sources?: { label: string; url: string | null }[];
  relatedQuestions?: string[];
  thinking?: boolean; // 답변 대기 중(플레이스홀더)
  idx?: number; // 메시지 순서
}

export interface BubbleProps {
  message: ChatMessage;
  conversationId: number | null;
  onRatingChange: (r: Rating) => void;
  onQuickSend: (q: string) => void;
}
