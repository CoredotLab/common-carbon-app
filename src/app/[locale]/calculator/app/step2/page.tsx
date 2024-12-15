"use client";

import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSelectedStore from "@/store/useSelectedStore";
import { useRouter } from "next/navigation";

const Step2: NextPage = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const recordId = searchParams.get("recordid");

  const { country, technology } = useSelectedStore();
  const router = useRouter();

  // Brick scenario inputs
  const [perDayBrick, setPerDayBrick] = useState<string>("10000");
  const [annualWorkdaysBrick, setAnnualWorkdaysBrick] = useState<string>("300");
  const [annualElectricityBrick, setAnnualElectricityBrick] =
    useState<string>("10000");
  const [annualDieselBrick, setAnnualDieselBrick] = useState<string>("1000");

  // Solar/Wind scenario inputs
  const [capacityMW, setCapacityMW] = useState<string>("100");
  const [dailyHours, setDailyHours] = useState<string>("10");
  const [annualDays, setAnnualDays] = useState<string>("300");
  const [utilization, setUtilization] = useState<string>("50"); // percent

  // focus 관리
  const [focusField, setFocusField] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "create") {
      console.log("Create mode - Step 2");
    } else if (mode === "view" && recordId) {
      console.log(`View mode - recordid: ${recordId}, Step 2`);
    } else {
      console.log("No mode - Step 2");
    }
  }, [mode, recordId]);

  const handleNextClick = () => {
    // 검증 로직
    if (!country || !technology) {
      alert("Please select a country and technology in Step 1 first.");
      return;
    }

    let valid = true;
    if (technology === "Non fired soil brick") {
      // 범위 체크
      const pb = clampInt(perDayBrick, 1, 200000);
      const aw = clampInt(annualWorkdaysBrick, 1, 365);
      const ae = clampFloat(annualElectricityBrick, 1, 100000);
      const ad = clampFloat(annualDieselBrick, 1, 100000);

      if (pb === null || aw === null || ae === null || ad === null) {
        valid = false;
      }
    } else {
      const cap = clampFloat(capacityMW, 1, 100000);
      const dh = clampFloat(dailyHours, 1, 24);
      const ady = clampFloat(annualDays, 1, 365);
      const uti = clampFloat(utilization, 0, 100);

      if (cap === null || dh === null || ady === null || uti === null) {
        valid = false;
      }
    }

    if (!valid) {
      alert(
        "Some values are out of range. Please correct them before proceeding."
      );
      return;
    }

    if (mode === "create") {
      router.push(`/en/calculator/app/finish?mode=create`);
    } else if (mode === "view" && recordId) {
      router.push(`/en/calculator/app/finish?mode=view&recordid=${recordId}`);
    } else {
      router.push("/en/calculator");
    }
  };

  // 범위 제한 함수
  const clampInt = (
    valStr: string,
    min: number,
    max: number
  ): number | null => {
    const val = parseInt(valStr, 10);
    if (isNaN(val)) return null;
    if (val < min || val > max) return null;
    return val;
  };
  const clampFloat = (
    valStr: string,
    min: number,
    max: number
  ): number | null => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return null;
    if (val < min || val > max) return null;
    return val;
  };

  const handleBrickChange =
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      min: number,
      max: number
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let valStr = e.target.value;
      const val = parseFloat(valStr);
      if (!isNaN(val)) {
        if (val < min) valStr = min.toString();
        if (val > max) valStr = max.toString();
      }
      setter(valStr);
    };

  const handleTechChange =
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      min: number,
      max: number
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let valStr = e.target.value;
      const val = parseFloat(valStr);
      if (!isNaN(val)) {
        if (val < min) valStr = min.toString();
        if (val > max) valStr = max.toString();
      }
      setter(valStr);
    };

  // input 공용 컴포넌트
  const InputField = ({
    label,
    placeholder,
    unitInfo,
    value,
    onChange,
    onFocus,
    onBlur,
    isFocused,
  }: {
    label: string;
    placeholder: string;
    unitInfo: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    isFocused: boolean;
  }) => (
    <div className="w-full relative flex flex-col items-start justify-start gap-2 text-left text-sm text-color-text-default font-label-large">
      <div className="self-stretch flex flex-row items-start justify-between">
        <b className="relative leading-[16px]">{label}</b>
        <div className="relative leading-[16px]">{unitInfo}</div>
      </div>
      <div
        className={`self-stretch rounded-number-common-radius-sm border-silver border-[1px] border-solid box-border h-11 overflow-hidden flex flex-row items-center justify-start py-0 px-3 text-lg ${
          isFocused ? "bg-azure text-color-common-primary" : "bg-white"
        }`}
      >
        <input
          className="w-full bg-transparent border-none outline-none leading-[20px]"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          type="number"
        />
      </div>
    </div>
  );

  // 결과 계산
  let result = 0;
  if (technology === "Non fired soil brick") {
    // Brick 계산 로직
    const pb = clampInt(perDayBrick, 1, 200000) || 0;
    const aw = clampInt(annualWorkdaysBrick, 1, 365) || 0;
    const ae = clampFloat(annualElectricityBrick, 1, 100000) || 0;
    const ad = clampFloat(annualDieselBrick, 1, 100000) || 0;

    const baseline_emission =
      6.18e-6 * aw * pb * 2.2 * 25.8 * 3.66 + ae * 0.722 + ad * 2.7;
    const project_emission =
      6.18e-6 * aw * pb * 2.2 * 25.8 * 3.66 + ae * 0.722 * 0.8 + ad * 2.7 * 0.5;
    const reductionVal = (baseline_emission - project_emission) * 20;
    result = reductionVal > 0 ? reductionVal : 0;
  } else {
    // Solar/Wind scenario
    const cap = clampFloat(capacityMW, 1, 100000) || 0;
    const dh = clampFloat(dailyHours, 1, 24) || 0;
    const ady = clampFloat(annualDays, 1, 365) || 0;
    const uti = clampFloat(utilization, 0, 100) || 0;

    // 모든 값 곱하기, utilization은 % -> fraction
    result = cap * dh * ady * (uti / 100);
  }

  return (
    <div className="w-full flex justify-center items-center md:pt-20">
      <div className="w-full max-w-[764px] md:max-h-[800px] max-h-[600px] relative rounded-2xl bg-white bg-opacity-[40%] overflow-hidden flex flex-col items-start justify-start p-8 box-border text-left text-sm text-color-text-light font-label-medium-bold overflow-y-auto">
        {/* Steps */}
        <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-6 gap-2">
          <div className="flex flex-row items-start justify-start gap-px">
            {/* Step1 done */}
            <button
              onClick={() => router.push("/en/calculator/app/step1-a")}
              className="w-20 bg-white bg-opacity-[40%] flex flex-row items-center justify-center p-2 box-border"
            >
              <b className="relative leading-[16px] opacity-[0.5]">Step 1</b>
            </button>
            {/* Current Step 2 */}
            <div className="w-20 rounded-tl-lg bg-color-text-default flex flex-row items-center justify-center p-2 box-border text-color-common-white">
              <b className="relative leading-[16px]">Step 2</b>
            </div>
            {/* Finish step */}
            <div className="w-20 bg-white bg-opacity-[40%] flex flex-row items-center justify-center p-2 box-border rounded-tr-lg">
              <b className="relative leading-[16px] opacity-[0.5]">Finish</b>
            </div>
          </div>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 text-5xl text-black">
            <b className="self-stretch relative leading-[32px]">
              Calculate your expected carbon reduction.
            </b>
          </div>
        </div>

        {/* Selected Item */}
        <div className="self-stretch flex flex-col items-start justify-end pt-6 pb-4 gap-2 text-base text-black">
          <b className="relative leading-[18px]">Selected Item</b>
          <div className="self-stretch flex flex-row items-center justify-start text-sm text-color-text-default gap-2">
            <div className="rounded-number-common-radius-full bg-gray-200 h-10 overflow-hidden flex flex-row items-center justify-center px-5">
              <div className="relative leading-[16px]">
                {country || "Not selected"}
              </div>
            </div>
            <div className="rounded-number-common-radius-full bg-gray-200 h-10 overflow-hidden flex flex-row items-center justify-center px-5">
              <div className="relative leading-[16px]">
                {technology || "Not selected"}
              </div>
            </div>
          </div>
        </div>

        {/* Input fields */}
        {technology === "Non fired soil brick" ? (
          <div className="w-full flex flex-col space-y-4 mb-4">
            <InputField
              label="Daily brick production"
              placeholder="1~200000 units"
              unitInfo="1~200000 units"
              value={perDayBrick}
              onChange={handleBrickChange(setPerDayBrick, 1, 200000)}
              onFocus={() => setFocusField("perDayBrick")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "perDayBrick"}
            />

            <InputField
              label="Annual working days"
              placeholder="1~365 days"
              unitInfo="1~365 days"
              value={annualWorkdaysBrick}
              onChange={handleBrickChange(setAnnualWorkdaysBrick, 1, 365)}
              onFocus={() => setFocusField("annualWorkdaysBrick")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "annualWorkdaysBrick"}
            />

            <InputField
              label="Annual electricity consumption"
              placeholder="1~100000 MWh"
              unitInfo="1~100000 MWh"
              value={annualElectricityBrick}
              onChange={handleBrickChange(setAnnualElectricityBrick, 1, 100000)}
              onFocus={() => setFocusField("annualElectricityBrick")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "annualElectricityBrick"}
            />

            <InputField
              label="Annual diesel consumption"
              placeholder="1~100000 KL"
              unitInfo="1~100000 KL"
              value={annualDieselBrick}
              onChange={handleBrickChange(setAnnualDieselBrick, 1, 100000)}
              onFocus={() => setFocusField("annualDieselBrick")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "annualDieselBrick"}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col space-y-4 mb-4">
            <InputField
              label="Generation capacity"
              placeholder="1~100000 MW"
              unitInfo="MW"
              value={capacityMW}
              onChange={handleTechChange(setCapacityMW, 1, 100000)}
              onFocus={() => setFocusField("capacityMW")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "capacityMW"}
            />
            <InputField
              label="Daily operational hours"
              placeholder="1~24 hours"
              unitInfo="Hours/day"
              value={dailyHours}
              onChange={handleTechChange(setDailyHours, 1, 24)}
              onFocus={() => setFocusField("dailyHours")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "dailyHours"}
            />
            <InputField
              label="Annual working days"
              placeholder="1~365 days"
              unitInfo="Days/year"
              value={annualDays}
              onChange={handleTechChange(setAnnualDays, 1, 365)}
              onFocus={() => setFocusField("annualDays")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "annualDays"}
            />
            <InputField
              label="Utilization rate"
              placeholder="0~100 %"
              unitInfo="%"
              value={utilization}
              onChange={handleTechChange(setUtilization, 0, 100)}
              onFocus={() => setFocusField("utilization")}
              onBlur={() => setFocusField(null)}
              isFocused={focusField === "utilization"}
            />
          </div>
        )}

        {/* Result */}
        <div className="self-stretch flex flex-col items-start justify-start gap-2 w-full">
          <div className="text-sm text-black font-bold">Result</div>
          <div className="flex flex-row items-center justify-between w-full">
            <span className="text-color-text-default text-sm">
              Expected carbon reduction over 20 years
            </span>
            <b className="text-xl text-black leading-[32px]">
              {result.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 5,
              })}{" "}
              tCO2eq
            </b>
          </div>
        </div>

        <div className="self-stretch flex justify-end pt-4">
          <button
            onClick={handleNextClick}
            className="w-[160px] relative rounded-[1000px] [background:linear-gradient(180deg,_#0d5247,_#0a3e36)] flex flex-row items-center justify-center py-2 px-[8px] box-border text-left text-base text-color-common-white font-label-medium-bold"
          >
            <b className="relative leading-[18px]">Next</b>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2;
