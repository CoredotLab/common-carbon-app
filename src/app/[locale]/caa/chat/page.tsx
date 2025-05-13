"use client";

import Image from "next/image";
import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import useAxios from "@/utils/axios"; // ⬅️ 커스텀 훅

export default function Page() {
  const router = useRouter();
  const api = useAxios(); // ⬅️ 준비된 axios 인스턴스

  /* ---------------- state ---------------- */
  const [samplePrompts, setSamplePrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");

  /* -------- 샘플 프롬프트 로드 -------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/chat_caa/sample-prompts", {
          params: { limit: 6 },
        });

        setSamplePrompts(data.map((p: any) => p.prompt_text));
      } catch (e) {
        console.error("샘플 프롬프트 불러오기 실패", e);
        setSamplePrompts([
          "Suggest suitable methodologies for my project",
          "Provide a detailed analysis of the carbon footprint of my product",
          "Generate a comprehensive carbon reduction report",
        ]); // fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePromptSubmit = () => {
    const prompt = inputPrompt.trim();
    if (!prompt) return;
    // 👉 질문만 쿼리로 넘기고 실제 API 호출은 Chat 화면에서
    router.push(`/en/caa/chat/new?prompt=${encodeURIComponent(prompt)}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const handleSampleClick = (text: string) => {
    setInputPrompt(text);
    // input 상태가 갱신된 뒤 바로 전송
    setTimeout(() => {
      handlePromptSubmit();
    }, 0);
  };

  /* -------------- UI -------------- */
  return (
    <div className="w-full h-full min-h-screen bg-white flex flex-col relative">
      {/* 헤더 */}
      <header className="w-full h-16 flex items-center px-4">
        <Image src="/caa/logo.svg" alt="logo" width={180} height={16} />
      </header>

      {/* 본문 */}
      <main className="flex-1 flex flex-col items-center justify-center mb-8">
        <div className="flex flex-col items-center gap-8">
          <p className="font-extrabold text-2xl">
            Unlocking Sustainable Futures
          </p>

          {/* 샘플 프롬프트 카드 */}
          <div className="flex gap-2">
            {(loading ? new Array(3).fill("") : samplePrompts).map((txt, i) => (
              <button
                key={i}
                disabled={!txt}
                onClick={() => handleSampleClick(txt)}
                className="h-[180px] flex-1 max-w-[261px] rounded-lg bg-aliceblue flex flex-col items-center justify-center p-5 gap-3 disabled:opacity-40"
              >
                <Image
                  src={`/caa/sample_prompt_${i + 1}.svg`}
                  alt=""
                  width={40}
                  height={40}
                />
                <span className="text-center text-sm">
                  {txt || "Loading..."}
                </span>
              </button>
            ))}
          </div>

          {/* 입력창 */}
          <div className="w-[640px] h-11 rounded-[22px] bg-aliceblue border border-lightsteelblue flex items-center pl-4 pr-1">
            <input
              className="flex-1 bg-transparent outline-none"
              placeholder="Ask anything about sustainability or methods..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={handlePromptSubmit}
              disabled={!inputPrompt.trim()}
              className="w-11 h-11 flex items-center justify-center disabled:opacity-40"
            >
              <Image
                src={
                  inputPrompt.trim()
                    ? "/caa/icon_send_active.svg"
                    : "/caa/icon_send.svg"
                }
                alt="send"
                width={22}
                height={19}
              />
            </button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="absolute bottom-10 w-full flex flex-col items-center gap-2 text-sm">
        <span>powered by</span>
        <div className="flex gap-5">
          <Image src="/caa/logo_avpn.svg" alt="avpn" width={72} height={40} />
          <Image src="/caa/logo_cocf.svg" alt="cocf" width={80} height={32} />
        </div>
      </footer>
    </div>
  );
}
