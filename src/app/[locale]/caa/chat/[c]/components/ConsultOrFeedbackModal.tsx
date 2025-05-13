"use client";

import { useState } from "react";
import Modal from "./Modal";
import useAxios from "@/utils/axios";
import toast from "react-hot-toast";

interface BaseProps {
  conversationId: number;
  open: boolean;
  onClose: () => void;
}

/* ───────────────── 상담 ───────────────── */
export function ConsultModal(props: BaseProps) {
  const { conversationId, open, onClose } = props;
  const api = useAxios();

  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) return toast.error("Message required");
    try {
      await api.post("/api/slack/consult-request", {
        conversation_id: conversationId,
        message,
        extra: phone ? { phone } : undefined,
      });
      toast.success("Consultation request sent");
      onClose();
    } catch (e) {
      toast.error("Send failed");
      console.error(e);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold mb-4">Consultation Request</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe what you need…"
        className="w-full h-28 border border-gray-300 rounded p-2 mb-3"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone / Zoom ID (optional)"
        className="w-full h-10 border border-gray-300 rounded p-2 mb-4"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-100 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
        >
          Send
        </button>
      </div>
    </Modal>
  );
}

/* ───────────────── 피드백 ───────────────── */
interface FeedbackModalProps {
  conversationId: number;
  open: boolean;
  onClose: () => void;
  /** optional - Reaction 버튼에서 열릴 때 넘겨주는 rating */
  initialRating?: "like" | "dislike";
  /** optional - Reaction 버튼에서 넘겨주는 assistant 원문  */
  targetMessage?: string;
}

export function FeedbackModal({
  conversationId,
  open,
  onClose,
  initialRating = "like",
  targetMessage = "",
}: FeedbackModalProps) {
  const api = useAxios();

  const [rating, setRating] = useState<"like" | "dislike">(initialRating);
  const [feedback, setFb] = useState("");

  const handleSubmit = async () => {
    if (!feedback.trim()) return toast.error("Please write something 🙂");

    // post params console
    console.log("conversationId", conversationId);
    console.log("rating", rating);
    console.log("feedback", feedback);
    console.log("targetMessage", targetMessage);

    try {
      await api.post("/api/slack/feedback", {
        conversation_id: conversationId,
        rating,
        feedback, // 사용자가 작성한 코멘트
      });

      toast.success("Thanks for your feedback!");
      onClose();
    } catch (e) {
      toast.error("Send failed");
      console.error(e);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold mb-4">Give us feedback</h2>

      {/* 평점 선택 */}
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="radio"
            value="like"
            checked={rating === "like"}
            onChange={() => setRating("like")}
          />
          <span>👍 Like</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="radio"
            value="dislike"
            checked={rating === "dislike"}
            onChange={() => setRating("dislike")}
          />
          <span>👎 Dislike</span>
        </label>
      </div>

      {/* 코멘트 */}
      <textarea
        value={feedback}
        onChange={(e) => setFb(e.target.value)}
        placeholder="Tell us more…"
        className="w-full h-32 border border-gray-300 rounded p-2 mb-4"
      />

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </Modal>
  );
}
