"use client";

import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useSelectedStore from "@/store/useSelectedStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface OpenDataItem {
  source: string;
  value: number;
  unit?: string;
  percentage?: number;
}

interface Desc01Data {
  hc_name: string;
  energy_production: { value: number; unit: string };
  total_energy_supply_by_source: OpenDataItem[];
  electricity_final_consumption: { value: number; unit: string };
  total_co2_emissions: { value: number; unit: string };
  global_emissions: { value: number; unit: string };
  source: string;
}

interface Desc02Data {
  hc_name: string;
  share_of_renewable_energy_in_power_generation: {
    value: number;
    unit: string;
  };
  renewable_energy_progress: OpenDataItem[];
  capacity_growth_by_generation_technology: OpenDataItem[];
  ndc_by_country: { source: string; value: number }[];
  source: string;
}

const Contents: NextPage = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // create 또는 view
  const session_id = searchParams.get("session_id"); // 숫자 형태의 id

  const { country, technology, setCountry, setTechnology } = useSelectedStore();
  const [aiSpeak, setAiSpeak] = useState<string>("");

  const [desc01Data, setDesc01Data] = useState<Desc01Data | null>(null);
  const [desc02Data, setDesc02Data] = useState<Desc02Data | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [fetchingAi, setFetchingAi] = useState(false); // AI 스트리밍 중 여부
  const [fetchComplete, setFetchComplete] = useState(false); // 스트리밍 or view data fetch 완료

  const [codeLanguage, setCodeLanguage] = useState<string>("EN");
  const [nameLanguage, setNameLanguage] = useState<string>("English");
  const [checkLanguage, setCheckLanguage] = useState<boolean>(false);

  const handleLanguage = async () => {
    try {
      const locale = new Intl.Locale(navigator.language).language;
      // 예외처리
      if (locale === null || locale === undefined || locale === "") {
        throw new Error("navigator.language is null or undefined");
      }

      await fetchLanguage(locale);
    } catch (error) {}
  };

  const fetchLanguage = async (code: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deepl/language?code=${code}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      setCodeLanguage(data.code);
      setNameLanguage(data.name);
      setCheckLanguage(true);
    } catch (error) {}
  };

  // create 모드에서 ai streaming
  const fetchAiSpeak = useCallback(async () => {
    if (mode === "view") return;
    if (
      !country ||
      country === "Not selected" ||
      !technology ||
      technology === "Not selected"
    )
      return;
    setAiSpeak("");
    setFetchingAi(true);
    setFetchComplete(false);

    try {
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/gemini/selectmt/desc?hc=${encodeURIComponent(
        country
      )}&mt=${encodeURIComponent(technology)}&lang=English`;

      const response = await fetch(url);
      if (!response.body) {
        setFetchingAi(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setAiSpeak(result);
      }

      setFetchingAi(false);
      setFetchComplete(true);
    } catch (error) {
      setFetchingAi(false);
    }
  }, [country, technology, mode]);

  useEffect(() => {
    if (mode === "create") {
      fetchAiSpeak();
    }
  }, [fetchAiSpeak, mode]);

  useEffect(() => {
    const doAsync = async () => {
      await handleLanguage();
    };
    doAsync();
  }, []);

  // view 모드일 경우 session_id로 session 정보 불러오기
  const fetchViewModeData = useCallback(async () => {
    if (mode === "view" && session_id) {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/calc_session/get_info?session_id=${session_id}`,
          {
            withCredentials: true,
          }
        );
        const data = res.data;

        if (data.aiSpeak) setAiSpeak(data.aiSpeak);

        // view 모드는 바로 완료 처리
        setFetchComplete(true);
      } catch (err) {}
    }
  }, [mode, session_id]);

  // country 변경 시 desc01, desc02 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!country || country === "Not selected") {
        setDesc01Data(null);
        setDesc02Data(null);
        return;
      }

      setLoading(true);
      try {
        const [d1, d2] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/selecthc/desc01_data?hc=${country}`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/selecthc/desc02_data?hc=${country}`
          ),
        ]);
        setDesc01Data(d1.data);
        setDesc02Data(d2.data);
      } catch (error) {
        setDesc01Data(null);
        setDesc02Data(null);
      } finally {
        setLoading(false);
      }
    };

    if (country && country !== "Not selected") {
      fetchData();
    }
  }, [country]);

  useEffect(() => {
    if (mode === "view") {
      fetchViewModeData();
    }
  }, [fetchViewModeData, mode]);

  useEffect(() => {
    if (mode === "create") {
    } else if (mode === "view" && session_id) {
    } else {
    }
  }, [mode, session_id]);

  const handleNextClick = async () => {
    if (!country || !technology) return;

    // create 모드이고 session_id있고 ai streaming 완료 후 next 시 ai_speak 업데이트
    if (mode === "create" && session_id) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/calc_session/update_ai_speak`,
          { session_id: session_id, ai_speak: aiSpeak },
          { withCredentials: true }
        );
      } catch (err) {}

      router.push(
        `/en/calculator/app/step2?mode=create&session_id=${session_id}`
      );
    } else if (mode === "view" && session_id && session_id) {
      router.push(
        `/en/calculator/app/step2?mode=view&session_id=${session_id}`
      );
    } else {
      // mode나 recordId, sessionId 없는 경우 fallback
      router.push("/en/calculator");
    }
  };

  const isNextDisabled = mode === "create" && (!fetchComplete || fetchingAi);

  return (
    <div className="w-full flex justify-center items-center md:py-20">
      <div className="w-full max-w-[764px] md:max-h-[800px] max-h-[600px] relative rounded-2xl bg-white bg-opacity-[40%] overflow-hidden flex flex-col items-start justify-start p-8 box-border text-left text-sm text-color-text-light font-label-medium-bold overflow-y-auto">
        {/* Steps */}
        <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-6 gap-2">
          <div className="flex flex-row items-start justify-start gap-px">
            <div className="w-20 rounded-tl-lg bg-color-text-default flex flex-row items-center justify-center p-2 box-border text-color-common-white">
              <b className="relative leading-[16px]">Step 1</b>
            </div>
            <div
              className={`w-20 bg-white bg-opacity-[40%] flex flex-row items-center justify-center p-2 box-border ${
                mode === "create" ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <b className="relative leading-[16px] opacity-[0.5]">Step 2</b>
            </div>
            <div
              className={`w-20 bg-white bg-opacity-[40%] flex flex-row items-center justify-center p-2 box-border rounded-tr-lg ${
                mode === "create" ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <b className="relative leading-[16px] opacity-[0.5]">Finish</b>
            </div>
          </div>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 md:text-5xl text-xl text-black">
            <b className="self-stretch relative leading-[32px]">
              Choose your country and technology
            </b>
            <div className="self-stretch relative text-sm leading-[16px]">
              The heatmap shows the expected carbon reduction for each country
              and technology combination, measured in 10,000 t CO2-eq. Please
              select one to proceed.
            </div>
          </div>
        </div>

        {/* Selected Item */}
        <div className="self-stretch flex flex-col items-start justify-end pt-6 px-0 pb-0 gap-2 text-base text-black">
          <b className="relative leading-[18px]">Selected Item</b>
          <div className="self-stretch flex flex-row items-center justify-between text-sm text-color-text-default">
            <div className="flex flex-row items-center justify-start gap-1">
              <div className="rounded-number-common-radius-full bg-gray-200 h-10 overflow-hidden flex flex-row items-center justify-center py-0 px-5 box-border">
                <div className="relative leading-[16px]">
                  {country || "Not selected"}
                </div>
              </div>
              <div className="rounded-number-common-radius-full bg-gray-200 h-10 overflow-hidden flex flex-row items-center justify-center py-0 px-5 box-border">
                <div className="relative leading-[16px]">
                  {technology || "Not selected"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 표 영역 */}
        <div className="w-full my-6">
          {(!country || country === "Not selected") && (
            <div className="text-center text-sm text-gray-500">
              Select a country first.
            </div>
          )}
          {country && country !== "Not selected" && (
            <>
              {loading && (
                <div className="text-center text-sm text-gray-500">
                  Loading data...
                </div>
              )}
              {!loading && desc01Data && desc02Data && (
                <div className="flex flex-col gap-8">
                  {/* Desc01 표 */}
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Energy Indicators ({desc01Data.hc_name})
                    </h3>
                    <div className="overflow-hidden flex flex-col gap-1 text-xs text-color-text-default font-body-tiny">
                      {/* Energy Production */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm flex flex-row items-center h-11">
                        <div className="w-60 flex items-center justify-center border-r border-gray-100 py-2 px-3 text-center font-bold leading-[14px]">
                          Energy Production
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                          {desc01Data.energy_production.value}{" "}
                          {desc01Data.energy_production.unit}
                        </div>
                      </div>

                      {/* Total energy supply by source */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm overflow-hidden">
                        <div className="flex flex-row items-center h-11 border-b border-gray-100">
                          <div className="w-60 flex items-center justify-center py-2 px-3 text-center font-bold leading-[14px]">
                            Total Energy Supply by Source
                          </div>
                          <div className="flex-1 flex items-center justify-center py-2 px-3 font-bold leading-[14px]">
                            Value (Unit)
                          </div>
                          <div className="flex-1 flex items-center justify-center py-2 px-3 font-bold leading-[14px]">
                            Percentage
                          </div>
                        </div>
                        {desc01Data.total_energy_supply_by_source.map(
                          (item, idx) => (
                            <div
                              key={idx}
                              className="flex flex-row items-center h-11 bg-white bg-opacity-[40%]"
                            >
                              <div className="w-60 flex items-center justify-center py-2 px-3 text-center leading-[14px]">
                                {item.source}
                              </div>
                              <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                                {item.value} {item.unit}
                              </div>
                              <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                                {item.percentage}%
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Electricity final consumption */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm flex flex-row items-center h-11">
                        <div className="w-60 flex items-center justify-center border-r border-gray-100 py-2 px-3 text-center font-bold leading-[14px]">
                          Electricity Final Consumption
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                          {desc01Data.electricity_final_consumption.value}{" "}
                          {desc01Data.electricity_final_consumption.unit}
                        </div>
                      </div>

                      {/* Total CO2 emissions */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm flex flex-row items-center h-11">
                        <div className="w-60 flex items-center justify-center border-r border-gray-100 py-2 px-3 text-center font-bold leading-[14px]">
                          Total CO2 Emissions
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                          {desc01Data.total_co2_emissions.value}{" "}
                          {desc01Data.total_co2_emissions.unit}
                        </div>
                      </div>

                      {/* Global emissions */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm flex flex-row items-center h-11">
                        <div className="w-60 flex items-center justify-center border-r border-gray-100 py-2 px-3 text-center font-bold leading-[14px]">
                          Global Emissions Contribution
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                          {desc01Data.global_emissions.value}
                          {desc01Data.global_emissions.unit}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desc02 표 */}
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Renewable Energy Indicators ({desc02Data.hc_name})
                    </h3>
                    <div className="overflow-hidden flex flex-col gap-1 text-xs text-color-text-default font-body-tiny">
                      {/* share_of_renewable_energy_in_power_generation */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm flex flex-row items-center h-11">
                        <div className="w-60 flex items-center justify-center border-r border-gray-100 py-2 px-3 text-center font-bold leading-[14px]">
                          Share of Renewable Energy in Power Generation
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                          {
                            desc02Data
                              .share_of_renewable_energy_in_power_generation
                              .value
                          }{" "}
                          {
                            desc02Data
                              .share_of_renewable_energy_in_power_generation
                              .unit
                          }
                        </div>
                      </div>

                      {/* renewable_energy_progress */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm overflow-hidden">
                        <div className="flex flex-row items-center h-11 border-b border-gray-100">
                          <div className="w-60 flex items-center justify-center py-2 px-3 text-center font-bold leading-[14px]">
                            Renewable Energy Progress
                          </div>
                          <div className="flex-1 flex items-center justify-center py-2 px-3 font-bold leading-[14px]">
                            Value (Unit)
                          </div>
                        </div>
                        {desc02Data.renewable_energy_progress.map(
                          (item, idx) => (
                            <div
                              key={idx}
                              className="flex flex-row items-center h-11 bg-white bg-opacity-[40%]"
                            >
                              <div className="w-60 flex items-center justify-center py-2 px-3 text-center leading-[14px]">
                                {item.source}
                              </div>
                              <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                                {item.value} {item.unit}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* capacity_growth_by_generation_technology */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm overflow-hidden">
                        <div className="flex flex-row items-center h-11 border-b border-gray-100">
                          <div className="w-60 flex items-center justify-center py-2 px-3 text-center font-bold leading-[14px]">
                            5-year Capacity Growth by Generation Technology
                          </div>
                          <div className="flex-1 flex items-center justify-center py-2 px-3 font-bold leading-[14px]">
                            Value (Unit)
                          </div>
                        </div>
                        {desc02Data.capacity_growth_by_generation_technology.map(
                          (item, idx) => (
                            <div
                              key={idx}
                              className="flex flex-row items-center h-11 bg-white bg-opacity-[40%]"
                            >
                              <div className="w-60 flex items-center justify-center py-2 px-3 text-center leading-[14px]">
                                {item.source}
                              </div>
                              <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                                {item.value} {item.unit}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* ndc_by_country */}
                      <div className="bg-gray-200 rounded-number-common-radius-sm overflow-hidden">
                        <div className="flex flex-row items-center h-11 border-b border-gray-100">
                          <div className="w-60 flex items-center justify-center py-2 px-3 text-center font-bold leading-[14px]">
                            NDC by Country
                          </div>
                          <div className="flex-1 flex items-center justify-center py-2 px-3 font-bold leading-[14px]">
                            Value (%)
                          </div>
                        </div>
                        {desc02Data.ndc_by_country.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-row items-center h-11 bg-white bg-opacity-[40%]"
                          >
                            <div className="w-60 flex items-center justify-center py-2 px-3 text-center leading-[14px]">
                              {item.source}
                            </div>
                            <div className="flex-1 flex items-center justify-center py-2 px-3 leading-[14px]">
                              {item.value}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-color-text-default">
                    Source: {desc01Data.source}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ai speak */}
        <div className="w-full relative flex flex-col items-start justify-start py-6 px-0 box-border gap-3 text-left text-lg text-black font-body-medium">
          <div className="flex flex-row items-center justify-start gap-2">
            <Image
              className="w-[21.4px] relative h-5"
              width={21}
              height={20}
              alt=""
              src="/calculator/icon_magic.svg"
            />
            <b className="relative leading-[25px]">Common Carbon Assistant</b>
          </div>
          <div className="relative text-base leading-[22px] text-color-text-default">
            {fetchingAi && (
              <div className="text-sm text-gray-500">
                Loading AI response...
                {/* 로딩 스피너 예: <Spinner/> */}
              </div>
            )}
            {!fetchingAi && !aiSpeak && mode === "view" && (
              <div className="md:text-sm text-base text-gray-500">
                No AI Data found.
              </div>
            )}
            <pre className="text-sm text-black whitespace-pre-wrap break-words">
              {aiSpeak}
            </pre>
          </div>
        </div>

        <div className="self-stretch flex justify-end">
          <button
            onClick={handleNextClick}
            disabled={isNextDisabled}
            className={`w-[160px] relative rounded-[1000px] [background:linear-gradient(180deg,_#0d5247,_#0a3e36)] flex flex-row items-center justify-center py-2 px-[8px] box-border text-left text-base font-label-medium-bold ${
              isNextDisabled
                ? "opacity-50 cursor-not-allowed"
                : "text-color-common-white cursor-pointer"
            }`}
          >
            <b className="relative leading-[18px]">Next</b>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contents;
