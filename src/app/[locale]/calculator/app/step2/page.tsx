"use client";

import type { NextPage } from "next";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useSelectedStore from "@/store/useSelectedStore";

// 재사용할 input component
const InputField = ({
  label,
  placeholder,
  unitInfo,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  unitInfo: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="w-full flex flex-col gap-1 text-sm text-color-text-default font-label-large">
      {/* Label + 범위 */}
      <div className="flex flex-row items-center justify-between">
        <b>{label}</b>
        <div className="text-xs">{unitInfo}</div>
      </div>
      {/* Input */}
      <div className="rounded-number-common-radius-sm border border-silver bg-white h-11 flex items-center px-3">
        <input
          type="number"
          className="w-full bg-transparent border-none outline-none"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled} // view 모드 시 disable
        />
      </div>
    </div>
  );
};

const Step2: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "create" | "view"
  const session_id = searchParams.get("session_id"); // 예: "123"

  // zustand store
  const { country, technology } = useSelectedStore();

  // scenario type ("brick" or "renewable")
  const [scenarioType, setScenarioType] = useState<"brick" | "renewable">(
    "renewable"
  );

  // Brick inputs
  const [perDayBrick, setPerDayBrick] = useState("100000");
  const [annualWorkdaysBrick, setAnnualWorkdaysBrick] = useState("260");
  const [annualElectricityBrick, setAnnualElectricityBrick] =
    useState("310.31");
  const [annualDieselBrick, setAnnualDieselBrick] = useState("730");

  // Renewable inputs
  const [capacityMW, setCapacityMW] = useState("12000");
  const [dailyHours, setDailyHours] = useState("24");
  const [annualDays, setAnnualDays] = useState("365");
  const [utilization, setUtilization] = useState("15");

  // 계산 결과 (간단 예시)
  const [result, setResult] = useState<number>(0);

  // ─────────────────────────────────────────────────────────
  // 1) localStorage에서 session_id
  // ─────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────
  // 2) view 모드라면 서버에서 값 가져와서 세팅
  // ─────────────────────────────────────────────────────────
  const fetchDataForViewMode = useCallback(async () => {
    if (mode === "view" && session_id) {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/calc_session/get_data_for_step2?session_id=${session_id}`;
        const res = await axios.get(url, { withCredentials: true });
        const data = res.data;
        // scenario type
        setScenarioType(data.scenario_type);
        if (data.scenario_type === "brick") {
          if (data.per_day_brick != null)
            setPerDayBrick(String(data.per_day_brick));
          if (data.annual_workdays_brick != null)
            setAnnualWorkdaysBrick(String(data.annual_workdays_brick));
          if (data.annual_electricity_brick != null)
            setAnnualElectricityBrick(String(data.annual_electricity_brick));
          if (data.annual_diesel_brick != null)
            setAnnualDieselBrick(String(data.annual_diesel_brick));
        } else {
          // renewable
          if (data.capacity_mw != null) setCapacityMW(String(data.capacity_mw));
          if (data.daily_hours != null) setDailyHours(String(data.daily_hours));
          if (data.annual_days != null) setAnnualDays(String(data.annual_days));
          if (data.utilization != null)
            setUtilization(String(data.utilization));
        }
      } catch (err) {
        alert("Could not load data for view mode");
      }
    }
  }, [mode, session_id]);

  useEffect(() => {
    if (mode === "view") {
      fetchDataForViewMode();
    } else if (mode === "create") {
      // 임의 예시: mt_id == 101 => brick 시나리오
      const mt_id = localStorage.getItem("mt_id");
      if (mt_id === "101") {
        setScenarioType("brick");
      }
    }
  }, [mode, fetchDataForViewMode]);

  useEffect(() => {
    if (mode === "create") {
    } else if (mode === "view" && session_id) {
    }
  }, [mode, session_id]);

  // ─────────────────────────────────────────────────────────
  // 3) Step buttons (Step1, Finish 등)
  // ─────────────────────────────────────────────────────────
  const handleStep1Click = () => {
    // Step1으로 이동
    if (!session_id) {
      // sessionId가 없을 수도 있지만, 일단 그냥 이동
      router.push(`/en/calculator/app/step1-a?mode=${mode}`);
    } else {
      // sessionId가 있다면 쿼리로 전달
      router.push(
        `/en/calculator/app/step1-a?mode=${mode}&session_id=${session_id}`
      );
    }
  };

  const handleFinishClick = () => {
    // Finish로 이동
    if (!session_id) {
      router.push(`/en/calculator/app/finish?mode=${mode}`);
    } else {
      router.push(
        `/en/calculator/app/finish?mode=${mode}&session_id=${session_id}`
      );
    }
  };

  // ─────────────────────────────────────────────────────────
  // 4) Next 버튼 클릭 => API update (create 모드만)
  // ─────────────────────────────────────────────────────────
  const handleNextClick = async () => {
    // country, technology가 선택되지 않았다면 알림
    if (
      !country ||
      !technology ||
      country === "Not selected" ||
      technology === "Not selected"
    ) {
      alert("Please select a country and technology in Step 1 first.");
      return;
    }

    // 저장할 데이터 구성
    const requestData: any = { session_id: session_id };

    function clampInt(strVal: string, min: number, max: number): number | null {
      const val = parseInt(strVal, 10);
      if (isNaN(val) || val < min || val > max) return null;
      return val;
    }
    function clampFloat(
      strVal: string,
      min: number,
      max: number
    ): number | null {
      const val = parseFloat(strVal);
      if (isNaN(val) || val < min || val > max) return null;
      return val;
    }

    let valid = true;

    if (scenarioType === "brick") {
      const pb = clampInt(perDayBrick, 1, 200000);
      const aw = clampInt(annualWorkdaysBrick, 1, 365);
      const ae = clampInt(annualElectricityBrick, 1, 100000);
      const ad = clampInt(annualDieselBrick, 1, 100000);
      if (pb === null || aw === null || ae === null || ad === null)
        valid = false;
      requestData.per_day_brick = pb;
      requestData.annual_workdays_brick = aw;
      requestData.annual_electricity_brick = ae;
      requestData.annual_diesel_brick = ad;
    } else {
      const cap = clampInt(capacityMW, 1, 100000);
      const dh = clampInt(dailyHours, 1, 24);
      const ady = clampInt(annualDays, 1, 365);
      const uti = clampFloat(utilization, 0, 100);
      if (cap === null || dh === null || ady === null || uti === null)
        valid = false;
      requestData.capacity_mw = cap;
      requestData.daily_hours = dh;
      requestData.annual_days = ady;
      requestData.utilization = uti;
    }

    if (!valid) {
      alert("Some input values are invalid or out of range.");
      return;
    }

    if (mode === "create" && session_id) {
      // create 모드라면 update_step2 API 호출
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/calc_session/update_step2`,
          requestData,
          { withCredentials: true }
        );
      } catch (err) {
        alert("Failed to update data");
        return;
      }
      // 다음 단계 (Finish)
      router.push(
        `/en/calculator/app/finish?mode=create&session_id=${session_id}`
      );
    } else if (mode === "view" && session_id) {
      // view 모드는 수정없이 그냥 finish
      router.push(
        `/en/calculator/app/finish?mode=view&session_id=${session_id}`
      );
    } else {
      // fallback
      router.push("/en/calculator");
    }
  };

  // ─────────────────────────────────────────────────────────
  // 5) Result 계산 (간단 예)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    let calc = 0;
    const intOrZero = (v: string) => parseInt(v, 10) || 0;
    const floatOrZero = (v: string) => parseFloat(v) || 0;
    if (scenarioType === "brick") {
      const pb = intOrZero(perDayBrick);
      const aw = intOrZero(annualWorkdaysBrick);
      const ae = intOrZero(annualElectricityBrick) * 0.722;
      const ad = intOrZero(annualDieselBrick) * 2.7;
      const baseline = 6.18e-6 * 300 * 100000 + 10000 + 1000; // 임의
      const project = 6.18e-6 * aw * pb + ae * 0.8 + ad * 0.5; // 임의
      calc = baseline - project;
    } else {
      const cap = intOrZero(capacityMW);
      const dh = intOrZero(dailyHours);
      const ady = intOrZero(annualDays);
      const uti = floatOrZero(utilization) / 100;
      calc = cap * dh * ady * uti;
    }
    setResult(calc > 0 ? calc : 0);
  }, [
    scenarioType,
    perDayBrick,
    annualWorkdaysBrick,
    annualElectricityBrick,
    annualDieselBrick,
    capacityMW,
    dailyHours,
    annualDays,
    utilization,
  ]);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  const isViewMode = mode === "view";
  const disabledInputs = isViewMode; // view 모드면 입력 비활성화

  return (
    <div className="w-full flex justify-center items-center md:pt-20">
      <div
        className="w-full max-w-[764px] bg-white bg-opacity-[40%]
        rounded-2xl p-8 box-border
        flex flex-col gap-4 overflow-y-auto"
      >
        {/* Step Indicator */}
        <div className="flex flex-row gap-px">
          {/* Step1 button */}
          <button
            onClick={handleStep1Click}
            className="w-20 bg-white bg-opacity-[40%] text-xs p-2 rounded-tl-md"
          >
            <b className="opacity-50">Step 1</b>
          </button>
          {/* Step2 current */}
          <div className="w-20 bg-color-text-default text-white p-2 flex items-center justify-center">
            <b>Step 2</b>
          </div>
          {/* Finish button */}
          <button
            onClick={handleFinishClick}
            className="w-20 bg-white bg-opacity-[40%] text-xs p-2 rounded-tr-md"
          >
            <b className="opacity-50">Finish</b>
          </button>
        </div>

        <div className="text-2xl text-black font-bold">
          Calculate your expected carbon reduction
        </div>

        {/* Selected Country / Tech */}
        <div className="text-base text-black font-bold">Selected Item</div>
        <div className="flex flex-row gap-2">
          <div className="bg-gray-200 rounded-full h-10 px-4 flex items-center">
            {country || "Not selected"}
          </div>
          <div className="bg-gray-200 rounded-full h-10 px-4 flex items-center">
            {technology || "Not selected"}
          </div>
        </div>

        {/* Inputs */}
        {scenarioType === "brick" ? (
          <div className="flex flex-col gap-4">
            <InputField
              label="Daily brick production"
              placeholder="1~200000"
              unitInfo="units"
              value={perDayBrick}
              onChange={(e) => setPerDayBrick(e.target.value)}
              disabled={disabledInputs}
            />
            <InputField
              label="Annual working days"
              placeholder="1~365"
              unitInfo="days"
              value={annualWorkdaysBrick}
              onChange={(e) => setAnnualWorkdaysBrick(e.target.value)}
              disabled={disabledInputs}
            />
            <InputField
              label="Annual electricity consumption"
              placeholder="1~100000"
              unitInfo="MWh"
              value={annualElectricityBrick}
              onChange={(e) => setAnnualElectricityBrick(e.target.value)}
              disabled={disabledInputs}
            />
            <InputField
              label="Annual diesel consumption"
              placeholder="1~100000"
              unitInfo="KL"
              value={annualDieselBrick}
              onChange={(e) => setAnnualDieselBrick(e.target.value)}
              disabled={disabledInputs}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <InputField
              label="Generation capacity"
              placeholder="1~100000"
              unitInfo="MW"
              value={capacityMW}
              onChange={(e) => setCapacityMW(e.target.value)}
              disabled={disabledInputs}
            />
            <InputField
              label="Daily operational hours"
              placeholder="1~24"
              unitInfo="hours/day"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              disabled={disabledInputs}
            />
            <InputField
              label="Annual working days"
              placeholder="1~365"
              unitInfo="days"
              value={annualDays}
              onChange={(e) => setAnnualDays(e.target.value)}
              disabled={disabledInputs}
            />
            <InputField
              label="Utilization rate"
              placeholder="0~100"
              unitInfo="%"
              value={utilization}
              onChange={(e) => setUtilization(e.target.value)}
              disabled={disabledInputs}
            />
          </div>
        )}

        {/* Result */}
        <div className="flex flex-col gap-1 text-black">
          <div className="text-sm font-bold">Result</div>
          <div className="flex flex-row items-center justify-between">
            <span>Expected carbon reduction per year</span>
            <b className="text-xl">
              {result.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              tCO2-eq
            </b>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNextClick}
            className="w-[160px] bg-gradient-to-b from-[#0d5247] to-[#0a3e36]
              text-color-common-white rounded-full py-2 px-4"
          >
            <b>Next</b>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2;
