"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import useSelectedStore from "@/store/useSelectedStore"; // zustand or recoil

interface BrickData {
  perDayBrick: number;
  baselineWorkdays: number;
  baselineElectricity: number;
  baselineDiesel: number;
  projectWorkdays: number;
  projectElectricity: number;
  totalCarbonEmissionReduction: number;
}

interface SessionInfo {
  session_id: string;
  aiSpeak?: string; // step1_ai_speak
  country: string;
  technology: string;
  mode: "create" | "view";
  status: "in_progress" | "completed";
  scenario_type: "brick" | "renewable";
  final_summary?: string;
}

export default function FinishPage() {
  // 1) 쿼리 파라미터
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "create" | "view"
  const session_id = searchParams.get("session_id");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>("");

  // 2) zustand (country, technology)
  const { country, technology } = useSelectedStore();

  // 3) sessionId + scenarioType (brick|renewable)

  const [scenarioType, setScenarioType] = useState<"brick" | "renewable">(
    "renewable"
  );

  // 4) iframe 미리보기용 HTML
  const [htmlTxt, setHtmlTxt] = useState<string | null>(null);

  // 5) Brick 시나리오 데이터 / Renewable 시 capacity
  const [brickData, setBrickData] = useState<BrickData | null>(null);
  const [capacity, setCapacity] = useState<string>("100");
  // ─────────────────────────────────────────────────────────
  // Reporting 모달 상태
  // ─────────────────────────────────────────────────────────
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState<string>("");

  // 유저 이메일 (예: 별도 API /auth/me or localStorage에서 가져온다고 가정)
  const [userEmail, setUserEmail] = useState<string>("unknown@user.com");

  // ─────────────────────────────────────────────────────────
  // 서버에서 final_data를 가져와 state 세팅
  // ─────────────────────────────────────────────────────────
  const fetchFinalDataFromServer = async (sid: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/calc_session/final_data?session_id=${sid}`;
      const res = await axios.get(url, { withCredentials: true });
      const data = res.data;
      // data: { scenario_type, capacity_mw, per_day_brick, ... }

      if (data.scenario_type === "brick") {
        setScenarioType("brick");
      } else {
        setScenarioType("renewable");
      }

      // capacity 세팅 (서버 값 우선)
      if (typeof data.capacity_mw === "number") {
        setCapacity(String(data.capacity_mw));
      }

      // brickData 세팅 (서버 값 우선)
      if (data.scenario_type === "brick") {
        const tempBrick: BrickData = {
          perDayBrick: data.per_day_brick || 10000,
          baselineWorkdays: 365,
          baselineElectricity: 54.7,
          baselineDiesel: 730,
          projectWorkdays: 260,
          projectElectricity: 310.31,
          totalCarbonEmissionReduction: data.reduction_value || 0,
        };
        setBrickData(tempBrick);
      }
      // 필요 시 country, technology도 서버값으로 덮어쓰기 가능
      // ...
    } catch (err) {
      // TODO: 에러 처리 필요 시
    }
  };

  // ─────────────────────────────────────────────────────────
  // iframe HTML 로드 (Renewable)
  // ─────────────────────────────────────────────────────────
  const addSampleHtmlTxtToMessages = async (cap: string) => {
    try {
      // hc, mt는 zustand
      const url = `${process.env.NEXT_PUBLIC_API_URL}/example?hc=${country}&mt=${technology}&capacity=${cap}&lang=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch example HTML");
      const data = await res.text();

      const srcDoc = `data:text/html;charset=utf-8,${encodeURIComponent(data)}`;
      setHtmlTxt(srcDoc);
    } catch (error) {}
  };

  // ─────────────────────────────────────────────────────────
  // iframe HTML 로드 (Brick)
  // ─────────────────────────────────────────────────────────
  const addSampleHtmlTxtToMessagesBrick = async () => {
    if (!brickData) return;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/exampleBrick?hc=${country}&perDayBrick=${brickData.perDayBrick}
      &baselineWorkdays=365&baselineElectricity=54.7&baselineDiesel=730
      &projectWorkdays=${brickData.projectWorkdays}
      &projectElectricity=${brickData.projectElectricity}
      &totalCarbonEmissionReduction=${brickData.totalCarbonEmissionReduction}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch exampleBrick HTML");
      const data = await res.text();

      const srcDoc = `data:text/html;charset=utf-8,${encodeURIComponent(data)}`;
      setHtmlTxt(srcDoc);
    } catch (error) {}
  };

  // ─────────────────────────────────────────────────────────
  // PDF 다운로드 (Renewable)
  // ─────────────────────────────────────────────────────────
  const downloadPdfFromServer = async () => {
    if (!capacity) {
      alert("No capacity found. Please check step2 data.");
      return;
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/example/pdf?hc=${country}&mt=${technology}&capacity=${capacity}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.setAttribute("download", "common-carbon-ai-prepdd.pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert("Failed to download PDF");
    }
  };

  // ─────────────────────────────────────────────────────────
  // PDF 다운로드 (Brick)
  // ─────────────────────────────────────────────────────────
  const downloadPdfFromServerBrick = async () => {
    if (!brickData) {
      alert("No brick data found. Please check step2 data.");
      return;
    }
    const {
      perDayBrick,
      baselineWorkdays,
      baselineElectricity,
      baselineDiesel,
      projectWorkdays,
      projectElectricity,
      totalCarbonEmissionReduction,
    } = {
      perDayBrick: brickData.perDayBrick || 10000,
      baselineWorkdays: 365,
      baselineElectricity: 54.7,
      baselineDiesel: 730,
      projectWorkdays: brickData.projectWorkdays || 260,
      projectElectricity: brickData.projectElectricity || 310.31,
      totalCarbonEmissionReduction: brickData.totalCarbonEmissionReduction || 0,
    };

    const url = `${process.env.NEXT_PUBLIC_API_URL}/exampleBrick/pdf?hc=${country}&perDayBrick=${perDayBrick}
      &baselineWorkdays=${baselineWorkdays}&baselineElectricity=${baselineElectricity}
      &baselineDiesel=${baselineDiesel}&projectWorkdays=${projectWorkdays}
      &projectElectricity=${projectElectricity}
      &totalCarbonEmissionReduction=${totalCarbonEmissionReduction}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.setAttribute("download", "common-carbon-ai-prepdd.pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert("Failed to download PDF");
    }
  };

  const fetchFinalSummary = useCallback(async (sid: string) => {
    try {
      // /calc_session/get_info?session_id=...
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/calc_session/get_info?session_id=${sid}`,
        { withCredentials: true }
      );
      const data = res.data;
      // e.g. {country: "...", technology: "...", scenario_type: "..."}
      // Zustand store에 반영
      setAiSummary(data.final_summary || "");
    } catch (err) {}
  }, []);

  // ─────────────────────────────────────────────────────────
  // 마운트 시: localStorage → setState, 그리고 서버 fetch
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    // localStorage에서 session_id 등 로드

    if (session_id) {
      if (mode === "view") fetchFinalSummary(session_id);
      if (mode === "create") startStreaming(session_id);
    }

    const st = localStorage.getItem("scenario_type");
    if (st === "brick") {
      setScenarioType("brick");
    }

    // create/view 모두 session_id가 있으면 서버에서 최신 데이터 fetch
    if (session_id) {
      fetchFinalDataFromServer(session_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id]);

  // ─────────────────────────────────────────────────────────
  // scenarioType, capacity 변경 시 iframe 재로드
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (scenarioType === "brick") {
      addSampleHtmlTxtToMessagesBrick();
    } else {
      addSampleHtmlTxtToMessages(capacity);
    }
  }, [scenarioType, capacity]);

  // 2) 스트리밍 함수
  const startStreaming = async (sid: string) => {
    try {
      setIsLoading(true);
      setAiSummary(""); // 초기화

      const url = `${process.env.NEXT_PUBLIC_API_URL}/calc_session/final_summary?session_id=${sid}&lang=en`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch streaming data");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader found in body");

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // 스트리밍 종료
        const chunkStr = new TextDecoder().decode(value);
        accumulated += chunkStr;
        // 화면에 “점진적으로” 반영하고 싶다면:
        setAiSummary(accumulated);
      }

      // 전체 스트리밍 끝난 시점
      setIsLoading(false);

      // 최종본 DB에 저장(원한다면)
      // updateFinalSummary(sid, accumulated);

      // or 사용자가 Next 버튼 누를 때 update 해도 됨
    } catch (err) {
      setIsLoading(false);
    }
  };

  // 3) 스트리밍 끝난 뒤 or Next 버튼에서 DB에 저장
  const updateFinalSummary = async (sid: string, summaryText: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/calc_session/update_final_summary`;
      await axios.post(
        url,
        { session_id: sid, final_summary: summaryText },
        { withCredentials: true }
      );
    } catch (err) {
      // alert("Failed to update final summary");
    }
  };

  // 4) Next 버튼 클릭 시
  const handleNext = async () => {
    if (isLoading) return; // 로딩 중이면 return
    if (session_id && aiSummary) {
      // DB 업데이트
      await updateFinalSummary(session_id, aiSummary);
    }
    // 이후 페이지 이동
    // router.push("/somewhere");
  };

  useEffect(() => {
    if (!isLoading) {
      handleNext();
    }
  }, [isLoading]);

  // ─────────────────────────────────────────────────────────
  // Home / Contact / Reporting
  // ─────────────────────────────────────────────────────────
  const handleHome = () => {
    router.push("/en/calculator/app/dashboard");
  };
  const handleContact = async () => {
    try {
      await navigator.clipboard.writeText("commoncarbon@ourfuture.kr");
      alert("Email address copied: commoncarbon@ourfuture.kr");
    } catch (err) {
      alert("Failed to copy email address");
    }
  };

  // 모달 열기
  const handleReporting = () => {
    setShowReportModal(true);
  };
  // 모달 닫기
  const closeReportModal = () => {
    setShowReportModal(false);
  };
  // 모달에서 "전송" 클릭 시 Slack 전송
  const submitReport = async () => {
    if (!reportText.trim()) {
      alert("Please enter a message.");
      return;
    }
    if (!session_id) {
      alert("No session_id found.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/slack/report`,
        {
          text: reportText,
          user_email: localStorage.getItem("email") || userEmail,
          session_id,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert("Report sent to Slack!");
        setReportText("");
        closeReportModal();
      } else {
        alert("Failed to send report.");
      }
    } catch (err: any) {
      alert("Error sending Slack report: " + err.message);
    }
  };

  // ─────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────
  return (
    <div className="w-full flex justify-center items-center md:py-20">
      <div
        className="w-full max-w-[764px] md:max-h-[800px] max-h-[600px]
           relative rounded-2xl bg-white bg-opacity-[40%]
           overflow-hidden flex flex-col items-start p-8 box-border
           text-left text-sm text-color-text-light font-label-medium-bold
           overflow-y-auto"
      >
        {/* 상단 헤더 */}
        <div className="w-full flex flex-col gap-2 pb-6">
          <div className="flex flex-row gap-px">
            <div className="w-20 bg-gray-200 p-2 hidden">
              <b className="opacity-50">Step 1</b>
            </div>
            <div className="w-20 bg-gray-200 p-2 hidden">
              <b className="opacity-50">Step 2</b>
            </div>
            <div className="rounded-lg bg-color-text-default flex items-center justify-center py-2 px-4 text-white">
              <b>Finish : Review your final report</b>
            </div>
          </div>
          <div className="text-lg text-black">
            <b>
              “Your report is generated with AI insights and suggestions.”
              <br />
              “Ask any additional questions you have, based on the current
              data.“
            </b>
          </div>
        </div>

        {/* Selected Item */}
        <div className="w-full flex flex-col gap-2 pb-4 text-base text-black">
          <b>Selected Item</b>
          <div className="flex flex-row gap-2 text-sm text-color-text-default">
            <div
              className="rounded-number-common-radius-full bg-gray-200
                 h-10 flex items-center justify-center px-5"
            >
              {country || "Not selected"}
            </div>
            <div
              className="rounded-number-common-radius-full bg-gray-200
                 h-10 flex items-center justify-center px-5"
            >
              {technology || "Not selected"}
            </div>
          </div>
        </div>

        {/* 미리보기 iframe */}
        <div className="w-full flex flex-col items-center gap-6 mt-4">
          <div
            className="self-stretch rounded-lg bg-white overflow-hidden
               flex flex-col items-center justify-center py-6 px-4"
          >
            {htmlTxt ? (
              <iframe
                src={htmlTxt}
                style={{
                  width: "75vw",
                  maxWidth: "570px",
                  height: "90vw",
                  maxHeight: "800px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <p className="text-center text-gray-500">
                Loading final preview...
              </p>
            )}
          </div>
          {/* 다운로드 버튼 */}
          <button
            onClick={
              scenarioType === "brick"
                ? downloadPdfFromServerBrick
                : downloadPdfFromServer
            }
            className="w-40 rounded-full bg-gradient-to-b
                       from-[#0d5247] to-[#0a3e36]
                       py-2 px-4 text-base text-color-common-white"
          >
            <b>Download</b>
          </button>
        </div>

        {/* AI 요약문 (placeholder) */}
        <div className="w-full flex flex-col gap-3 mt-6 text-black">
          <div className="flex flex-row gap-2">
            <Image
              className="w-[21.4px] h-5"
              width={21}
              height={20}
              alt=""
              src="/calculator/icon_magic.svg"
            />
            <b className="text-lg">Common Carbon Assistant</b>
          </div>
          {/* 로딩 상태 표시 */}
          {isLoading && <div className="loader">Loading AI summary...</div>}

          {/* 스트리밍 된 AI 문장 */}
          <div style={{ whiteSpace: "pre-wrap" }}>
            {aiSummary || "(No summary yet)"}
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="w-full flex flex-row justify-center gap-2 mt-6 text-sm">
          <button
            onClick={handleHome}
            className="rounded-full bg-white bg-opacity-60 h-8
                       px-4 flex items-center justify-center"
          >
            <b>Home</b>
          </button>
          <button
            onClick={handleContact}
            className="rounded-full bg-white bg-opacity-60 h-8
                       px-4 flex items-center justify-center"
          >
            <b>Contact</b>
          </button>
          <button
            onClick={handleReporting}
            className="rounded-full bg-white bg-opacity-60 h-8
                       px-4 flex items-center justify-center"
          >
            <b>Reporting</b>
          </button>
        </div>
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-[400px] p-4 rounded shadow-lg flex flex-col gap-2">
              <h2 className="text-xl font-bold">Report an Issue</h2>
              {/* <p className="text-sm text-gray-700">
                session_id: {session_id || "(none)"}
              </p> */}
              <textarea
                className="border rounded p-2 w-full h-32 text-black"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe your issue or feedback..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={closeReportModal}
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
