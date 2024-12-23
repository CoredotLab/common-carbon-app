"use client";
import Image from "next/image";
import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { InfinitySpin } from "react-loader-spinner";
import shortid from "shortid";

interface IMessage {
  id: number;
  text?: string;
  sender: "user" | "server";
  type?: "image" | "button" | "html" | "href"; // null 이면 text
  desc?: string; // image일 경우 url, button일 경우 href
}

interface MessageState {
  teller: "user" | "server";
  isTyping: boolean; // 유저가 입력할 차례일 경우 true, 그리고 ... 애니메이션 보여준다.
  questionType: "objective" | "subjective";
  currentScenario: Scenario;
  isServerThinking: boolean;
}

enum Scenario {
  SERVER_GREETING = "SERVER_GREETING",
  CHOOSE_TECHNOLOGY = "CHOOSE_TECHNOLOGY",
  CHOOSE_TECHNOLOGY_ONLY = "CHOOSE_TECHNOLOGY_ONLY", // 기술만 알아서, 기술 먼저 선택한 경우. 이후에 hc 추천해줌.
  LEARN_MORE = "LEARN_MORE", // 아무것도 모르는 경우 CIM 설명 + CIM 링크(_blank)
  ENTER_CAPACITY = "ENTER_CAPACITY", // 용량 입력
  RECOMMEND_HC = "RECOMMEND_HC", // 기술만 알아서, 기술 먼저 선택한 경우. 이후에 hc 추천해줌.
  ENTER_CAPACITY_2 = "ENTER_CAPACITY_2", // 용량 입력
  ENTER_GENERATION = "ENTER_GENERATION", // 발전량 입력
  ENTER_HOURS = "ENTER_HOURS", // 운영시간 입력
  ENTER_DAYS = "ENTER_DAYS", // 운영일수 입력
  ENTER_UTILIZATION_RATE = "ENTER_UTILIZATION_RATE", // 이용률 입력
  GET_PDD = "GET_PDD", // PDD 보여주기
  ENTER_PER_DAY_BRICK = "ENTER_PER_DAY_BRICK", // 하루 생산 벽돌 입력
  ENTER_BASELINE_WORKDAYS = "ENTER_BASELINE_WORKDAYS", // 기준일수 입력
  ENTER_BASELINE_ELECTRICITY = "ENTER_BASELINE_ELECTRICITY", // 기준 전기 사용량 입력
  ENTER_BASELINE_DIESEL = "ENTER_BASELINE_DIESEL", // 기준 디젤 사용량 입력
  ENTER_PROJECT_WORKDAYS = "ENTER_PROJECT_WORKDAYS", // 프로젝트 일수 입력
  ENTER_PROJECT_ELECTRICITY = "ENTER_PROJECT_ELECTRICITY", // 프로젝트 전기 사용량 입력
  GET_PDD_BRICK = "GET_PDD_BRICK", // PDD 보여주기
}

interface ObjectiveAnswer {
  answer: string;
  answerTranslated: string;
  nextScenario: Scenario;
  hc?: string;
}

interface NonFiredSoilBrickData {
  bricksPerDay: string;
  baselineWorkdaysPerYear: string;
  baselineElectricityConsumption: string;
  baselineDieselConsumption: string;
  projectWorkdaysPerYear: string;
  projectElectricityConsumption: string;
  totalCarbonEmissionReduction: string;
}

export default function Home() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputOnFocus, setInputOnFocus] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<MessageState>({
    teller: "server",
    isTyping: false,
    questionType: "objective",
    currentScenario: Scenario.SERVER_GREETING,
    isServerThinking: true,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRequestGreeting, setIsRequestGreeting] = useState<boolean>(false);
  const [objectiveAnswers, setObjectiveAnswers] = useState<ObjectiveAnswer[]>(
    []
  );
  const [choosenHc, setChoosenHc] = useState<string>("");
  const [choosenMt, setChoosenMt] = useState<string>("");
  const [choosenCapacity, setChoosenCapacity] = useState<string>("");
  const [generation, setGeneration] = useState<string>(""); // MW
  const [operatingHours, setOperatingHours] = useState<string>("24"); // hour / day
  const [operatingDays, setOperatingDays] = useState<string>("365"); // days/year
  const [utilizationRate, setUtilizationRate] = useState<string>("15"); // %

  const [inputedSoilBrickData, setInputedSoilBrickData] =
    useState<NonFiredSoilBrickData>({
      bricksPerDay: "100000",
      baselineWorkdaysPerYear: "365",
      baselineElectricityConsumption: "54.7",
      baselineDieselConsumption: "730",
      projectWorkdaysPerYear: "260",
      projectElectricityConsumption: "310.31",
      totalCarbonEmissionReduction: "872827.13",
    });

  const [htmlTxt, setHtmlTxt] = useState<string>("");

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

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() === "") {
      return;
    }
    // only digit
    if (messageState.currentScenario === Scenario.ENTER_GENERATION) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }
    }

    // setChoosenCapacity((prev) => inputValue);
    if (messageState.currentScenario === Scenario.ENTER_GENERATION) {
      setGeneration(inputValue);
      const capacity =
        (Number(inputValue) *
          Number(operatingHours) *
          Number(operatingDays) *
          Number(utilizationRate)) /
        100;
      setChoosenCapacity(capacity.toString());
      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " MW";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Calcuated capacity is " +
            capacity +
            " MWh/year. This capacity calculated by the formula: generation * operating hours * operating days * utilization rate. And each value is " +
            inputValue +
            " MW, " +
            operatingHours +
            " hours/day, " +
            operatingDays +
            " days/year, " +
            utilizationRate +
            "%." +
            "Edit the value if you want to change the capacity. Or click the button to get the PDD report."
        ),
        sender: "server",
      };
      setInputValue("");
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswers();

      return;
    }

    if (messageState.currentScenario === Scenario.ENTER_HOURS) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      if (
        Number(inputValue) > 24 ||
        Number(inputValue) <= 0 ||
        inputValue === ""
      ) {
        alert("Please enter a number between 0 and 24.");
        return;
      }

      // 소수점 없음 not float
      if (inputValue.includes(".")) {
        alert("Please enter only digits. No decimal point.");
        return;
      }

      setOperatingHours(inputValue);
      const capacity =
        (Number(generation) *
          Number(inputValue) *
          Number(operatingDays) *
          Number(utilizationRate)) /
        100;
      setChoosenCapacity(capacity.toString());
      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " hours/day";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      setInputValue("");
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Calcuated capacity is " +
            capacity +
            " MWh/year. This capacity calculated by the formula: generation * operating hours * operating days * utilization rate. And each value is " +
            generation +
            " MW, " +
            inputValue +
            " hours/day, " +
            operatingDays +
            " days/year, " +
            utilizationRate +
            "%." +
            "Edit the value if you want to change the capacity. Or click the button to get the PDD report."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswers();
      return;
    }

    if (messageState.currentScenario === Scenario.ENTER_DAYS) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      if (
        Number(inputValue) > 365 ||
        Number(inputValue) <= 0 ||
        inputValue === ""
      ) {
        alert("Please enter a number between 0 and 365.");
        return;
      }

      // 소수점 없음 not float
      if (inputValue.includes(".")) {
        alert("Please enter only digits. No decimal point.");
        return;
      }

      setOperatingDays(inputValue);
      const capacity =
        (Number(generation) *
          Number(operatingHours) *
          Number(inputValue) *
          Number(utilizationRate)) /
        100;
      setChoosenCapacity(capacity.toString());
      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " days/year";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      setInputValue("");
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Calcuated capacity is " +
            capacity +
            " MWh/year. This capacity calculated by the formula: generation * operating hours * operating days * utilization rate. And each value is " +
            generation +
            " MW, " +
            operatingHours +
            " hours/day, " +
            inputValue +
            " days/year, " +
            utilizationRate +
            "%." +
            "Edit the value if you want to change the capacity. Or click the button to get the PDD report."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswers();
      return;
    }

    if (messageState.currentScenario === Scenario.ENTER_UTILIZATION_RATE) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      if (
        Number(inputValue) > 100 ||
        Number(inputValue) <= 0 ||
        inputValue === ""
      ) {
        alert("Please enter a number between 0 and 100.");
        return;
      }

      // 소수점 없음 not float
      if (inputValue.includes(".")) {
        alert("Please enter only digits. No decimal point.");
        return;
      }

      setOperatingHours(inputValue);
      const capacity =
        (Number(generation) *
          Number(operatingHours) *
          Number(operatingDays) *
          Number(inputValue)) /
        100;
      setChoosenCapacity(capacity.toString());
      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + "%";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      setInputValue("");
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Calcuated capacity is " +
            capacity +
            " MWh/year. This capacity calculated by the formula: generation * operating hours * operating days * utilization rate. And each value is " +
            generation +
            " MW, " +
            operatingHours +
            " hours/day, " +
            operatingDays +
            " days/year, " +
            inputValue +
            "%." +
            "Edit the value if you want to change the capacity. Or click the button to get the PDD report."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswers();
      return;
    }

    const lastMessage = messages[messages.length - 1];
    lastMessage.text = inputValue + " MWh/year";
    const capacity = inputValue;
    setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
    // 마지막 메시지 없애고, 사용자 메시지 추가
    setMessageState((prev) => ({
      ...prev,
      teller: "server",
      isTyping: false,
    }));
    setInputValue("");
    setTimeout(() => {
      handleAllInputed(choosenHc, choosenMt, capacity);
    }, 1000);
  };

  const sendMessageBrick = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() === "") {
      return;
    }

    // ENTER_PER_DAY_BRICK
    if (messageState.currentScenario === Scenario.ENTER_PER_DAY_BRICK) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      const originalBrickData = inputedSoilBrickData;
      originalBrickData.bricksPerDay = inputValue;
      originalBrickData.totalCarbonEmissionReduction =
        calculateAndSetBrickData(originalBrickData);
      setInputedSoilBrickData(originalBrickData);

      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + "  bricks/day";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          `Thank you for entering the values. The calculation uses the following baseline figures: daily brick production of ( ${originalBrickData.bricksPerDay} units), annual workdays of (${originalBrickData.baselineWorkdaysPerYear} days), annual electricity consumption of (${originalBrickData.baselineElectricityConsumption} MWh), and annual diesel consumption of (${originalBrickData.baselineDieselConsumption}KL). For the project, the annual workdays are (${originalBrickData.projectWorkdaysPerYear}days) and the annual electricity consumption is (${originalBrickData.projectElectricityConsumption}MWh). The estimated carbon reduction over 20 years is (${originalBrickData.totalCarbonEmissionReduction}tCO2eq). If you would like to change any values, please select them, or choose to proceed with the current calculation.`
        ),
        sender: "server",
      };
      setInputValue("");
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswersBrick();
      return;
    }

    // ENTER_BASELINE_WORKDAYS
    if (messageState.currentScenario === Scenario.ENTER_BASELINE_WORKDAYS) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      const originalBrickData = inputedSoilBrickData;
      originalBrickData.baselineWorkdaysPerYear = inputValue;
      originalBrickData.totalCarbonEmissionReduction =
        calculateAndSetBrickData(originalBrickData);
      setInputedSoilBrickData(originalBrickData);

      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " days/year";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          `Thank you for entering the values. The calculation uses the following baseline figures: daily brick production of ( ${originalBrickData.bricksPerDay} units), annual workdays of (${originalBrickData.baselineWorkdaysPerYear} days), annual electricity consumption of (${originalBrickData.baselineElectricityConsumption} MWh), and annual diesel consumption of (${originalBrickData.baselineDieselConsumption}KL). For the project, the annual workdays are (${originalBrickData.projectWorkdaysPerYear}days) and the annual electricity consumption is (${originalBrickData.projectElectricityConsumption}MWh). The estimated carbon reduction over 20 years is (${originalBrickData.totalCarbonEmissionReduction}tCO2eq). If you would like to change any values, please select them, or choose to proceed with the current calculation.`
        ),
        sender: "server",
      };
      setInputValue("");
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswersBrick();
      return;
    }

    // ENTER_BASELINE_ELECTRICITY
    if (messageState.currentScenario === Scenario.ENTER_BASELINE_ELECTRICITY) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      const originalBrickData = inputedSoilBrickData;
      originalBrickData.baselineElectricityConsumption = inputValue;
      originalBrickData.totalCarbonEmissionReduction =
        calculateAndSetBrickData(originalBrickData);
      setInputedSoilBrickData(originalBrickData);

      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " MWh";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          `Thank you for entering the values. The calculation uses the following baseline figures: daily brick production of ( ${originalBrickData.bricksPerDay} units), annual workdays of (${originalBrickData.baselineWorkdaysPerYear} days), annual electricity consumption of (${originalBrickData.baselineElectricityConsumption} MWh), and annual diesel consumption of (${originalBrickData.baselineDieselConsumption}KL). For the project, the annual workdays are (${originalBrickData.projectWorkdaysPerYear}days) and the annual electricity consumption is (${originalBrickData.projectElectricityConsumption}MWh). The estimated carbon reduction over 20 years is (${originalBrickData.totalCarbonEmissionReduction}tCO2eq). If you would like to change any values, please select them, or choose to proceed with the current calculation.`
        ),
        sender: "server",
      };
      setInputValue("");
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswersBrick();
      return;
    }

    // ENTER_BASELINE_DIESEL
    if (messageState.currentScenario === Scenario.ENTER_BASELINE_DIESEL) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      const originalBrickData = inputedSoilBrickData;
      originalBrickData.baselineDieselConsumption = inputValue;
      originalBrickData.totalCarbonEmissionReduction =
        calculateAndSetBrickData(originalBrickData);
      setInputedSoilBrickData(originalBrickData);

      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " KL";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          `Thank you for entering the values. The calculation uses the following baseline figures: daily brick production of ( ${originalBrickData.bricksPerDay} units), annual workdays of (${originalBrickData.baselineWorkdaysPerYear} days), annual electricity consumption of (${originalBrickData.baselineElectricityConsumption} MWh), and annual diesel consumption of (${originalBrickData.baselineDieselConsumption}KL). For the project, the annual workdays are (${originalBrickData.projectWorkdaysPerYear}days) and the annual electricity consumption is (${originalBrickData.projectElectricityConsumption}MWh). The estimated carbon reduction over 20 years is (${originalBrickData.totalCarbonEmissionReduction}tCO2eq). If you would like to change any values, please select them, or choose to proceed with the current calculation.`
        ),
        sender: "server",
      };
      setInputValue("");
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswersBrick();
      return;
    }

    // ENTER_PROJECT_WORKDAYS
    if (messageState.currentScenario === Scenario.ENTER_PROJECT_WORKDAYS) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      const originalBrickData = inputedSoilBrickData;
      originalBrickData.projectWorkdaysPerYear = inputValue;
      originalBrickData.totalCarbonEmissionReduction =
        calculateAndSetBrickData(originalBrickData);
      setInputedSoilBrickData(originalBrickData);

      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " days/year";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          `Thank you for entering the values. The calculation uses the following baseline figures: daily brick production of ( ${originalBrickData.bricksPerDay} units), annual workdays of (${originalBrickData.baselineWorkdaysPerYear} days), annual electricity consumption of (${originalBrickData.baselineElectricityConsumption} MWh), and annual diesel consumption of (${originalBrickData.baselineDieselConsumption}KL). For the project, the annual workdays are (${originalBrickData.projectWorkdaysPerYear}days) and the annual electricity consumption is (${originalBrickData.projectElectricityConsumption}MWh). The estimated carbon reduction over 20 years is (${originalBrickData.totalCarbonEmissionReduction}tCO2eq). If you would like to change any values, please select them, or choose to proceed with the current calculation.`
        ),
        sender: "server",
      };
      setInputValue("");
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswersBrick();
      return;
    }

    // ENTER_PROJECT_ELECTRICITY
    if (messageState.currentScenario === Scenario.ENTER_PROJECT_ELECTRICITY) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }

      const originalBrickData = inputedSoilBrickData;
      originalBrickData.projectElectricityConsumption = inputValue;
      originalBrickData.totalCarbonEmissionReduction =
        calculateAndSetBrickData(originalBrickData);
      setInputedSoilBrickData(originalBrickData);

      const lastMessage = messages[messages.length - 1];
      lastMessage.text = inputValue + " MWh";
      setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        questionType: "objective",
        isTyping: true,
      }));
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          `Thank you for entering the values. The calculation uses the following baseline figures: daily brick production of ( ${originalBrickData.bricksPerDay} units), annual workdays of (${originalBrickData.baselineWorkdaysPerYear} days), annual electricity consumption of (${originalBrickData.baselineElectricityConsumption} MWh), and annual diesel consumption of (${originalBrickData.baselineDieselConsumption}KL). For the project, the annual workdays are (${originalBrickData.projectWorkdaysPerYear}days) and the annual electricity consumption is (${originalBrickData.projectElectricityConsumption}MWh). The estimated carbon reduction over 20 years is (${originalBrickData.totalCarbonEmissionReduction}tCO2eq). If you would like to change any values, please select them, or choose to proceed with the current calculation.`
        ),
        sender: "server",
      };
      setInputValue("");
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);

      await getCalculateEnterGenerationAnswersBrick();
      return;
    }

    // GET_PDD_BRICK
    const lastMessage = messages[messages.length - 1];
    lastMessage.text = inputValue + " bricks/day";
    // 새롭게 method 만들어서 넘겨줘야함. 위 모든 변수들
    // TODO
    setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
    setMessageState((prev) => ({
      ...prev,
      teller: "server",
      isTyping: false,
    }));
    setInputValue("");
    setTimeout(() => {
      // TODO need new method
      // handleAllInputed(choosenHc, choosenMt, inputValue);
      handleAllInputedBrick(
        choosenHc,
        inputedSoilBrickData.bricksPerDay,
        inputedSoilBrickData.baselineWorkdaysPerYear,
        inputedSoilBrickData.baselineElectricityConsumption,
        inputedSoilBrickData.baselineDieselConsumption,
        inputedSoilBrickData.projectWorkdaysPerYear,
        inputedSoilBrickData.projectElectricityConsumption,
        inputedSoilBrickData.totalCarbonEmissionReduction
      );
    }, 1000);
  };

  const calculateAndSetBrickData = (brickData: NonFiredSoilBrickData) => {
    const baselineEmission =
      (Number(brickData.bricksPerDay) *
        Number(brickData.baselineWorkdaysPerYear) *
        2.2 *
        0.00000618 *
        25.8 *
        3.66 +
        Number(brickData.baselineElectricityConsumption) * 0.722 +
        1971) *
      20;

    const projectEmission =
      (Number(brickData.bricksPerDay) *
        Number(brickData.projectWorkdaysPerYear) *
        2.2 *
        0.00000618 *
        25.8 *
        3.66 +
        Number(brickData.projectElectricityConsumption) * 0.722 +
        0) *
      20;

    const leakage = 88.6;

    const totalCarbonEmissionReduction =
      baselineEmission - projectEmission - leakage;

    return String(totalCarbonEmissionReduction);
  };

  const handleAllInputed = async (hc: string, mt: string, capacity: string) => {
    // pdd 일부 보여주기
    handleShowPdd(capacity);
    // 조언

    // cim 링크
    setTimeout(() => {
      addCimDescToMessages();
      addCimImageToMessages();
      addCimHrefToMessages();
    }, 5000);
  };

  const handleAllInputedBrick = async (
    hc: string,
    perDayBrick: string,
    baselineWorkdays: string,
    baselineElectricity: string,
    baselineDiesel: string,
    projectWorkdays: string,
    projectElectricity: string,
    totalCarbonEmissionReduction: string
  ) => {
    // pdd 일부 보여주기
    handleShowPddBrick(
      hc,
      perDayBrick,
      baselineWorkdays,
      baselineElectricity,
      baselineDiesel,
      projectWorkdays,
      projectElectricity,
      totalCarbonEmissionReduction
    );
    // 조언

    // cim 링크
    setTimeout(() => {
      addCimDescToMessages();
      addCimImageToMessages();
      addCimHrefToMessages();
    }, 5000);
  };

  const handleShowPddBrick = async (
    hc: string,
    perDayBrick: string,
    baselineWorkdays: string,
    baselineElectricity: string,
    baselineDiesel: string,
    projectWorkdays: string,
    projectElectricity: string,
    totalCarbonEmissionReduction: string
  ) => {
    // 먼저 안내
    const message1: IMessage = {
      id: Date.now(),
      text: await getTranslatedText(
        "Congratulations on successfully completing all the questions! Please be patient just a little longer as I am now compiling the results for you."
      ),
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, message1]);
    setTimeout(async () => {
      const message2: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "PDD Report (Partial): A preliminary overview of your project's design document."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message2]);
    }, 1000);
    setTimeout(() => {
      addSampleHtmlTxtToMessagesBrick(
        hc,
        perDayBrick,
        baselineWorkdays,
        baselineElectricity,
        baselineDiesel,
        projectWorkdays,
        projectElectricity,
        totalCarbonEmissionReduction
      );
    }, 2000);
  };

  const addSampleHtmlTxtToMessagesBrick = async (
    hc: string,
    perDayBrick: string,
    baselineWorkdays: string,
    baselineElectricity: string,
    baselineDiesel: string,
    projectWorkdays: string,
    projectElectricity: string,
    totalCarbonEmissionReduction: string
  ) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/exampleBrick?hc=${hc}&perDayBrick=${perDayBrick}&baselineWorkdays=${baselineWorkdays}&baselineElectricity=${baselineElectricity}&baselineDiesel=${baselineDiesel}&projectWorkdays=${projectWorkdays}&projectElectricity=${projectElectricity}&totalCarbonEmissionReduction=${totalCarbonEmissionReduction}`;
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const srcDoc = `data:text/html;charset=utf-8,${encodeURIComponent(
          data
        )}`;
        setHtmlTxt(data);
        const message: IMessage = {
          id: Date.now(),
          text: srcDoc,
          sender: "server",
          type: "html",
        };
        setMessages((currentMessages) => [...currentMessages, message]);
        addDownloadPdfButtonToMessages();
      });
  };

  const handleShowPdd = async (capacity: string) => {
    // 먼저 안내
    const message1: IMessage = {
      id: Date.now(),
      text: await getTranslatedText(
        "Congratulations on successfully completing all the questions! Please be patient just a little longer as I am now compiling the results for you."
      ),
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, message1]);
    setTimeout(async () => {
      const message2: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "PDD Report (Partial): A preliminary overview of your project's design document."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message2]);
    }, 1000);
    setTimeout(() => {
      addSampleHtmlTxtToMessages(capacity);
    }, 2000);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const fetchGreeting = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/greeting?lang=${nameLanguage}`
    );
    const reader = response.body?.getReader();

    return new ReadableStream({
      async start(controller) {
        function push() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            const text = new TextDecoder().decode(value);

            controller.enqueue(text);
            push();
          });
        }
        push();
      },
    });
  };
  useEffect(() => {
    const doAsync = async () => {
      await handleLanguage();
    };
    doAsync();
  }, []);

  useEffect(() => {
    if (isRequestGreeting) {
      return;
    }

    if (!checkLanguage) {
      return;
    }

    setIsRequestGreeting(true);
    const handleFetchGreeting = async () => {
      const stream = await fetchGreeting();
      const reader = stream.getReader();
      const chunks: string[] = [];
      if (messages.length === 0) {
        const emptyMessage: IMessage = {
          id: Date.now(),
          text: "",
          sender: "server",
        };
        setMessages((currentMessages) => [...currentMessages, emptyMessage]);
      }

      function read() {
        reader.read().then(({ done, value }) => {
          chunks.push(value);
          const text = chunks.join("");

          if (done) {
            // time delay
            setTimeout(async () => {
              const chooseHostCountryOrNotMessage: IMessage = {
                id: Date.now() + 2,
                text: await getTranslatedText(
                  "Do you know where you want to host your project?"
                ),
                sender: "server",
              };
              setMessageState((prev) => ({
                ...prev,
                teller: "server",
                isTyping: false,
              }));
              setMessages((currentMessages) => [
                ...currentMessages,
                chooseHostCountryOrNotMessage,
              ]);
              setMessageState((prev) => ({
                ...prev,
                teller: "user",
                isTyping: true,
              }));
              setMessages((currentMessages) => [
                ...currentMessages,
                { id: Date.now() + 3, text: "", sender: "user" },
              ]);
              getGreetingObjectiveAnswers();
            }, 1000);

            return;
          }

          if (value.includes("\n")) {
            // 앞뒤로 자르고 끊어주기
            const parts = value.split("\n");
            const part_length = parts.length;
            for (let i = 0; i < part_length - 1; i++) {
              if (parts[i].trim() === "") {
                continue;
              }
              setMessageState((prev) => ({
                ...prev,
                isServerThinking: false,
              }));
              setMessages((currentMessages) => {
                const newMessages = [...currentMessages];
                const lastMessage = currentMessages[currentMessages.length - 1];
                lastMessage.text += parts[i];
                return newMessages;
              });
            }
            const newMessage: IMessage = {
              id: Date.now() + 1,
              text: parts[part_length - 1],
              sender: "server",
            };
            setMessages((currentMessages) => [...currentMessages, newMessage]);
          } else {
            setMessages((currentMessages) => {
              const newMessages = [...currentMessages];
              const lastMessage = currentMessages[currentMessages.length - 1];
              lastMessage.text += value;
              return newMessages;
            });
          }

          read();
        });
      }

      read();
    };

    handleFetchGreeting();
  }, [checkLanguage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getTranslatedText = async (text: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/deepl/translate`;
      const body = {
        text: text,
        target_code: codeLanguage,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return text;
    }
  };

  const getGreetingObjectiveAnswers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/greeting/objective?code=${codeLanguage}`
    );
    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const getCalculateEnterGenerationAnswers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/calculate/entergeneration?code=${codeLanguage}`
    );
    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const getCalculateEnterGenerationAnswersBrick = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/calculate/entergenerationbrick?code=${codeLanguage}`
    );
    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const handleSelectObjectiveAnswer = async (
    answer: string,
    answerTranslated: string,
    nextScenario: Scenario,
    hc?: string
  ) => {
    // 사용자 마지막 답변을 선택한 답변으로 변경 처리
    const lastMessage = messages[messages.length - 1];
    lastMessage.text = answerTranslated;
    setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
    setMessageState((prev) => ({
      ...prev,
      teller: "server",
      isTyping: false,
    }));

    // TODO: 서버에 선택한 답변을 보내고, 다음 시나리오를 받아온다.
    if (nextScenario === Scenario.CHOOSE_TECHNOLOGY) {
      // host country 선택한 경우
      await handleFetchSelectHcDesc01(answer);
      setChoosenHc(answer);
      // setTimeout(async () => {
      //   await handleFetchSelectHcDesc02(answer);
      // }, 15000);
    }

    if (nextScenario === Scenario.CHOOSE_TECHNOLOGY_ONLY) {
      // host country 선택 안한 경우, mitigation technology 만 알고 있는 경우, 다음에 mitigation technology 선택.
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          `Please select the mitigation technology you are interested in. Available mitigation technologies are ${choosenMt} for now.`
        ),
        sender: "server",
      };
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
      }));
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
      getSelectMtObjectiveAnswers();
    }

    if (nextScenario === Scenario.RECOMMEND_HC) {
      setChoosenMt(answer);
      await handleFetchSelectMtRecommendHc(answer);
    }

    if (nextScenario === Scenario.LEARN_MORE) {
      // 아무것도 모르는 경우, CIM 설명 + CIM 링크(_blank)
      handleFetchDontKnowAnything();
    }

    if (nextScenario === Scenario.ENTER_CAPACITY) {
      // 용량 입력
      setChoosenMt(answer);
      handleFetchSelectHcMtDesc(hc as string, answer);
    }

    if (nextScenario === Scenario.ENTER_CAPACITY_2) {
      // 용량 입력
      setChoosenHc(answer);
      handleFetchSelectHcMtDesc(answer, choosenMt === "" ? "Solar" : choosenMt);
    }

    if (nextScenario === Scenario.ENTER_HOURS) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the number of hours the facility operates per day. (0-24)"
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_HOURS,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.ENTER_DAYS) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the number of days the facility operates per year. (0-365)"
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_DAYS,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.ENTER_UTILIZATION_RATE) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the number of utilization rate of the facility in percentage. (0-100)"
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_UTILIZATION_RATE,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.GET_PDD) {
      // 총 몇 MWh/year 인지 알려주는 Message 전송
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "The total capacity of the facility is " +
            choosenCapacity +
            " MWh/year." +
            "Let's see the PDD report."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);

      // PDD 보여주기
      handleAllInputed(choosenHc, choosenMt, choosenCapacity);
    }

    // brick 관련
    if (nextScenario === Scenario.ENTER_BASELINE_WORKDAYS) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the number of workdays in the baseline scenario."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_BASELINE_WORKDAYS,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.ENTER_BASELINE_ELECTRICITY) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the annual electricity consumption in the baseline scenario."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_BASELINE_ELECTRICITY,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.ENTER_BASELINE_DIESEL) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the annual diesel consumption in the baseline scenario."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_BASELINE_DIESEL,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.ENTER_PROJECT_WORKDAYS) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the number of workdays in the project scenario."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_PROJECT_WORKDAYS,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.ENTER_PROJECT_ELECTRICITY) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText(
          "Please enter the annual electricity consumption in the project scenario."
        ),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageState((prev) => ({
        ...prev,
        teller: "user",
        isTyping: true,
        questionType: "subjective",
        currentScenario: Scenario.ENTER_PROJECT_ELECTRICITY,
      }));
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 3, text: "", sender: "user" },
      ]);
    }

    if (nextScenario === Scenario.GET_PDD_BRICK) {
      const message: IMessage = {
        id: Date.now(),
        text: await getTranslatedText("Let's see the PDD report."),
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, message]);

      // PDD 보여주기
      handleAllInputedBrick(
        choosenHc,
        inputedSoilBrickData.bricksPerDay,
        inputedSoilBrickData.baselineWorkdaysPerYear,
        inputedSoilBrickData.baselineElectricityConsumption,
        inputedSoilBrickData.baselineDieselConsumption,
        inputedSoilBrickData.projectWorkdaysPerYear,
        inputedSoilBrickData.projectElectricityConsumption,
        inputedSoilBrickData.totalCarbonEmissionReduction
      );
    }

    setObjectiveAnswers([]);
  };

  const fetchSelectMtRecommendHc = async (mt_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selectmt/recommendhc?mt=${mt_name}&lang=${nameLanguage}`
    );
    const reader = response.body?.getReader();

    return new ReadableStream({
      async start(controller) {
        function push() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            const text = new TextDecoder().decode(value);
            controller.enqueue(text);
            push();
          });
        }
        push();
      },
    });
  };

  const handleFetchSelectMtRecommendHc = async (mt_name: string) => {
    const stream = await fetchSelectMtRecommendHc(mt_name);
    const reader = stream.getReader();
    const chunks: string[] = [];
    const emptyMessage: IMessage = {
      id: Date.now(),
      text: "",
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, emptyMessage]);

    function read() {
      reader.read().then(({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          setTimeout(async () => {
            const chooseHostCountry: IMessage = {
              id: Date.now() + 2,
              text: await getTranslatedText(
                "Please select the host country you are interested in."
              ),
              sender: "server",
            };
            setMessageState((prev) => ({
              ...prev,
              teller: "server",
              isTyping: false,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              chooseHostCountry,
            ]);
            setMessageState((prev) => ({
              ...prev,
              teller: "user",
              isTyping: true,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: Date.now() + 3, text: "", sender: "user" },
            ]);
            getSelectMtRecommendHcObjectiveAnswers();
          }, 1000);
          return;
        }

        if (value.includes("\n")) {
          // 앞뒤로 자르고 끊어주기
          const parts = value.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => {
              const newMessages = [...currentMessages];
              const lastMessage = currentMessages[currentMessages.length - 1];
              lastMessage.text += parts[i];
              return newMessages;
            });
          }
          const newMessage: IMessage = {
            id: Date.now() + 1,
            text: parts[part_length - 1],
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, newMessage]);
        } else {
          setMessages((currentMessages) => {
            const newMessages = [...currentMessages];
            const lastMessage = currentMessages[currentMessages.length - 1];
            lastMessage.text += value;
            return newMessages;
          });
        }

        read();
      });
    }

    read();
  };

  const handleEnterGeneration = async (hc: string, mt: string) => {
    setChoosenMt(mt);
    const message: IMessage = {
      id: Date.now(),
      text: await getTranslatedText(
        mt === "Non-Fired Soil Brick"
          ? "Please enter the daily brick production quantity (number of bricks) for your facility."
          : `Please enter the capacity of ${mt} power generation facilities in MW`
      ),
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, message]);
    setMessageState((prev) => ({
      ...prev,
      teller: "user",
      isTyping: true,
      questionType: "subjective",
      currentScenario:
        mt === "Non-Fired Soil Brick"
          ? Scenario.ENTER_PER_DAY_BRICK
          : Scenario.ENTER_GENERATION,
    }));
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now() + 3, text: "", sender: "user" },
    ]);
  };

  const fetchSelectHcMtDesc = async (hc_name: string, mt_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selectmt/desc?hc=${hc_name}&mt=${mt_name}&lang=${nameLanguage}`
    );
    const reader = response.body?.getReader();

    return new ReadableStream({
      async start(controller) {
        function push() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            const text = new TextDecoder().decode(value);
            controller.enqueue(text);
            push();
          });
        }
        push();
      },
    });
  };

  const handleFetchSelectHcMtDesc = async (
    hc_name: string,
    mt_name: string
  ) => {
    const stream = await fetchSelectHcMtDesc(hc_name, mt_name);
    const reader = stream.getReader();
    const chunks: string[] = [];
    const emptyMessage: IMessage = {
      id: Date.now(),
      text: "",
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, emptyMessage]);

    function read() {
      reader.read().then(({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          setTimeout(() => {
            handleEnterGeneration(hc_name, mt_name);
          }, 1000);
          return;
        }
        if (value.includes("\n")) {
          // 앞뒤로 자르고 끊어주기
          const parts = value.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => {
              const newMessages = [...currentMessages];
              const lastMessage = currentMessages[currentMessages.length - 1];
              lastMessage.text += parts[i];
              return newMessages;
            });
          }
          const newMessage: IMessage = {
            id: Date.now() + 1,
            text: parts[part_length - 1],
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, newMessage]);
        } else {
          setMessages((currentMessages) => {
            const newMessages = [...currentMessages];
            const lastMessage = currentMessages[currentMessages.length - 1];
            lastMessage.text += value;
            return newMessages;
          });
        }

        read();
      });
    }

    read();
  };

  const fetchSelectHcDesc01 = async (hc_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selecthc/desc01?hc=${hc_name}&lang=${nameLanguage}`
    );
    const reader = response.body?.getReader();

    return new ReadableStream({
      async start(controller) {
        function push() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            const text = new TextDecoder().decode(value);
            controller.enqueue(text);
            push();
          });
        }
        push();
      },
    });
  };

  const handleFetchSelectHcDesc01 = async (hc_name: string) => {
    const stream = await fetchSelectHcDesc01(hc_name);
    const reader = stream.getReader();
    const chunks: string[] = [];
    const emptyMessage: IMessage = {
      id: Date.now(),
      text: "",
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, emptyMessage]);

    function read() {
      reader.read().then(async ({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          await handleFetchSelectHcDesc02(hc_name);

          return;
        }
        if (value.includes("\n")) {
          // 앞뒤로 자르고 끊어주기
          const parts = value.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => {
              const newMessages = [...currentMessages];
              const lastMessage = currentMessages[currentMessages.length - 1];
              lastMessage.text += parts[i];
              return newMessages;
            });
          }
          const newMessage: IMessage = {
            id: Date.now() + 1,
            text: parts[part_length - 1],
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, newMessage]);
        } else {
          setMessages((currentMessages) => {
            const newMessages = [...currentMessages];
            const lastMessage = currentMessages[currentMessages.length - 1];
            lastMessage.text += value;
            return newMessages;
          });
        }

        read();
      });
    }

    read();
  };

  const fetchSelectHcDesc02 = async (hc_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selecthc/desc02?hc=${hc_name}&lang=${nameLanguage}`
    );
    const reader = response.body?.getReader();

    return new ReadableStream({
      async start(controller) {
        function push() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            const text = new TextDecoder().decode(value);
            controller.enqueue(text);
            push();
          });
        }
        push();
      },
    });
  };

  const handleFetchSelectHcDesc02 = async (hc_name: string) => {
    const stream = await fetchSelectHcDesc02(hc_name);
    const reader = stream.getReader();
    const chunks: string[] = [];
    const emptyMessage: IMessage = {
      id: Date.now(),
      text: "",
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, emptyMessage]);

    setMessageState((prev) => ({
      ...prev,
      isServerThinking: false,
    }));

    function read() {
      reader.read().then(({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          setTimeout(async () => {
            const chooseMitigationTechnology: IMessage = {
              id: Date.now() + 2,
              text: await getTranslatedText(
                "This mitigation technology is available in the following countries. Please select the mitigation technology you are interested in."
              ),
              sender: "server",
            };
            setMessageState((prev) => ({
              ...prev,
              teller: "server",
              isTyping: false,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              chooseMitigationTechnology,
            ]);
            setMessageState((prev) => ({
              ...prev,
              teller: "user",
              isTyping: true,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: Date.now() + 3, text: "", sender: "user" },
            ]);

            getSelectHcObjectiveAnswers(hc_name);
          }, 1000);

          return;
        }
        if (value.includes("\n")) {
          // 앞뒤로 자르고 끊어주기
          const parts = value.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => {
              const newMessages = [...currentMessages];
              const lastMessage = currentMessages[currentMessages.length - 1];
              lastMessage.text += parts[i];
              return newMessages;
            });
          }
          const newMessage: IMessage = {
            id: Date.now() + 1,
            text: parts[part_length - 1],
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, newMessage]);
        } else {
          setMessages((currentMessages) => {
            const newMessages = [...currentMessages];
            const lastMessage = currentMessages[currentMessages.length - 1];
            lastMessage.text += value;
            return newMessages;
          });
        }

        read();
      });
    }

    read();
  };

  const getSelectHcObjectiveAnswers = async (hc: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selecthc/objective?hc=${hc}&code=${codeLanguage}`
    );

    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const getSelectMtObjectiveAnswers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selectmt/objective?code=${codeLanguage}`
    );

    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const getSelectMtRecommendHcObjectiveAnswers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selectmt/recommendhc/objective?code=${codeLanguage}`
    );

    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const fetchDontKnowAnything = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/greeting/dont-know-anything?lang=${nameLanguage}`
    );
    const reader = response.body?.getReader();

    return new ReadableStream({
      async start(controller) {
        function push() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            const text = new TextDecoder().decode(value);
            controller.enqueue(text);
            push();
          });
        }
        push();
      },
    });
  };

  const handleFetchDontKnowAnything = async () => {
    setMessageState((prev) => ({
      ...prev,
      isServerThinking: true,
    }));
    const stream = await fetchDontKnowAnything();
    const reader = stream.getReader();
    const chunks: string[] = [];
    const emptyMessage: IMessage = {
      id: Date.now(),
      text: "",
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, emptyMessage]);

    function read() {
      reader.read().then(({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          setMessageState((prev) => ({
            ...prev,
            isServerThinking: false,
          }));
          addCimDescToMessages();
          addCimImageToMessages();
          addCimHrefToMessages();
          return;
        }
        if (value.includes("\n")) {
          // 앞뒤로 자르고 끊어주기
          const parts = value.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => {
              const newMessages = [...currentMessages];
              const lastMessage = currentMessages[currentMessages.length - 1];
              lastMessage.text += parts[i];
              return newMessages;
            });
          }
          const newMessage: IMessage = {
            id: Date.now() + 1,
            text: parts[part_length - 1],
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, newMessage]);
        } else {
          setMessages((currentMessages) => {
            const newMessages = [...currentMessages];
            const lastMessage = currentMessages[currentMessages.length - 1];
            lastMessage.text += value;
            return newMessages;
          });
        }

        read();
      });
    }

    read();
  };

  const addCimDescToMessages = async () => {
    const cimDescMessage: IMessage = {
      id: Date.now(),
      text: await getTranslatedText(
        "The Carbon Impact Map (CIM) is a global map showcasing the current carbon reduction efforts worldwide, offering a detailed view of each country's carbon reductions by technology."
      ),
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, cimDescMessage]);
  };

  const addCimImageToMessages = () => {
    const cimImageMessage: IMessage = {
      id: Date.now(),
      text: "",
      sender: "server",
      type: "image",
      desc: "/cal/image_screenshot_cim.png",
    };
    setMessages((currentMessages) => [...currentMessages, cimImageMessage]);
  };

  const addCimHrefToMessages = () => {
    const cimHrefMessage: IMessage = {
      id: Date.now() + 100,
      sender: "server",
      type: "href",
      desc: "/en/cim",
    };
    setMessages((currentMessages) => [...currentMessages, cimHrefMessage]);
  };

  const addSampleHtmlTxtToMessages = (capacity: string) => {
    const capacityValue = choosenCapacity === "" ? capacity : choosenCapacity;
    // fetch from server
    const url = `${process.env.NEXT_PUBLIC_API_URL}/example?hc=${choosenHc}&mt=${choosenMt}&capacity=${capacityValue}&lang=${nameLanguage}`;

    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const srcDoc = `data:text/html;charset=utf-8,${encodeURIComponent(
          data
        )}`;
        setHtmlTxt(data);
        const message: IMessage = {
          id: Date.now(),
          text: srcDoc,
          sender: "server",
          type: "html",
        };
        setMessages((currentMessages) => [...currentMessages, message]);
        addDownloadPdfButtonToMessages();
      });
  };

  const addDownloadPdfButtonToMessages = () => {
    const downloadPdfButton: IMessage = {
      id: Date.now(),
      text: "Download PDD Report",
      sender: "server",
      type: "button",
      desc: "downloadPdfButton",
    };
    setMessages((currentMessages) => [...currentMessages, downloadPdfButton]);
  };

  // real
  const downloadPdfFromServer = async (capacity: string) => {
    const capacityValue = choosenCapacity === "" ? capacity : choosenCapacity;
    // const choosenHc = "Vietnam";
    // const choosenMt = "Solar";

    const url = `${process.env.NEXT_PUBLIC_API_URL}/example/pdf?hc=${choosenHc}&mt=${choosenMt}&capacity=${capacityValue}`;
    try {
      // fileresponse로 받음
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.setAttribute("download", `common-carbon-ai-prepdd.pdf`); // 파일명
      document.body.appendChild(a);
      a.click();
      a.parentNode?.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {}
  };

  const downloadPdfFromServerBrick = async () => {
    const inputValues = inputedSoilBrickData;
    const hc = choosenHc;
    const perDayBrick = inputValues.bricksPerDay;
    const baselineWorkdays = inputValues.baselineWorkdaysPerYear;
    const baselineElectricity = inputValues.baselineElectricityConsumption;
    const baselineDiesel = inputValues.baselineDieselConsumption;
    const projectWorkdays = inputValues.projectWorkdaysPerYear;
    const projectElectricity = inputValues.projectElectricityConsumption;
    const totalCarbonEmissionReduction =
      inputValues.totalCarbonEmissionReduction;

    const url = `${process.env.NEXT_PUBLIC_API_URL}/exampleBrick/pdf?hc=${hc}&perDayBrick=${perDayBrick}&baselineWorkdays=${baselineWorkdays}&baselineElectricity=${baselineElectricity}&baselineDiesel=${baselineDiesel}&projectWorkdays=${projectWorkdays}&projectElectricity=${projectElectricity}&totalCarbonEmissionReduction=${totalCarbonEmissionReduction}`;
    try {
      // fileresponse로 받음
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.setAttribute("download", `common-carbon-ai-prepdd.pdf`); // 파일명
      document.body.appendChild(a);
      a.click();
      a.parentNode?.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {}
  };

  // useEffect(() => {
  // downloadPdfFromServer("100000");
  // }, []);

  useEffect(() => {
    if (messageState.teller === "user") {
      setMessageState((prev) => ({
        ...prev,
        isServerThinking: false,
      }));
    }
  }, [messageState.teller]);

  return (
    <main className="flex flex-col items-center pt-20 px-4 pb-4 font-pretendard min-h-screen max-h-screen overflow-hidden">
      <div className="flex flex-col w-full bg-white max-w-[770px] rounded-lg shadow flex-grow overflow-hidden">
        <div className="flex items-center space-x-3 p-4 bg-white text-[20px] font-bold rounded-t-lg">
          <Image
            src="/cal/image_carbonai.png"
            alt="Logo"
            width={40}
            height={40}
          />
          <span>Common Carbon AI Assistant</span>
        </div>
        <div
          className="flex-1 p-4 overflow-y-auto flex-col flex space-y-2"
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <div
              key={shortid.generate()}
              className={`p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-white text-primary font-bold self-end text-right rounded-tr-none border border-gray-300 shadow-lg"
                  : "bg-primary text-black self-start rounded-tl-none bg-opacity-20 shadow-lg"
              } inline-block max-w-[90%] break-words`}
            >
              {message.sender === "user" &&
                messageState.isTyping &&
                index === messages.length - 1 && (
                  <div className="flex items-center gap-2 p-2">
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{
                        animationDelay: "0s",
                      }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{
                        animationDelay: "0.25s",
                      }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{
                        animationDelay: "0.5s",
                      }}
                    />
                  </div>
                )}
              {
                // 이미지 메시지
                message.type === "image" && (
                  <div
                    className="mt-2 relative 
                  w-[300px]
                  h-[200px]
                  "
                  >
                    <Image src={message.desc as string} alt="Image" fill />
                  </div>
                )
              }
              {
                // href 메시지
                message.type === "href" && (
                  <a
                    href={message.desc as string}
                    target="_blank"
                    className="text-white font-bold py-2 px-4 rounded-[10px] border border-primary bg-primary hover:bg-white hover:text-primary transition-all duration-300 ease-in-out text-sm"
                  >
                    Learn more
                  </a>
                )
              }
              {
                // 버튼 메시지
                message.type === "button" && (
                  <button
                    className="text-white font-bold py-2 px-4 rounded-[10px] border border-primary bg-primary hover:bg-white hover:text-primary transition-all duration-300 ease-in-out text-sm"
                    onClick={() => {
                      if (message.desc === "downloadPdfButton") {
                        if (choosenMt === "Non-Fired Soil Brick") {
                          downloadPdfFromServerBrick();
                        } else {
                          downloadPdfFromServer(choosenCapacity);
                        }
                      }
                    }}
                  >
                    {message.text}
                  </button>
                )
              }
              {/* {message.type === "html" && (
                <div
                  className="mt-2"
                  dangerouslySetInnerHTML={{ __html: message.text as string }}
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
              )} */}
              {message.type === "html" && (
                <iframe
                  className="mt-2"
                  src={message.text as string}
                  style={{
                    width: "75vw",
                    maxWidth: "570px",
                    height: "90vw",
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
              )}
              {message.text !== "Internal Server Error" &&
                message.type === undefined && (
                  <div className="text-md">{message.text}</div>
                )}
              {/* {message.text} */}
            </div>
          ))}
        </div>
      </div>
      {/* {
        // 객관식 답변
        messageState.questionType === "objective" &&
          messageState.teller === "user" && (
            <div className="w-full bg-white max-w-[770px] mt-4">
              <div className="flex flex-row justify-center gap-2">
                {objectiveAnswers.map((answer) => (
                  <button
                    key={answer.answer}
                    className="text-primary font-bold py-2 px-4 rounded-[30px] border border-primary hover:bg-primary hover:text-white transition-all duration-300 ease-in-out text-sm"
                    onClick={() => {
                      handleSelectObjectiveAnswer(
                        answer.answer,
                        answer.answerTranslated,
                        answer.nextScenario,
                        answer.hc
                      );
                    }}
                  >
                    {answer.answerTranslated}
                  </button>
                ))}
              </div>
            </div>
          )
      } */}
      {
        // 객관식 답변
        messageState.questionType === "objective" &&
          messageState.teller === "user" && (
            <div className="w-full bg-white max-w-[770px] mt-4 px-4 py-2">
              <div className="flex flex-wrap justify-center gap-2">
                {objectiveAnswers.map((answer) => (
                  <button
                    key={answer.answer}
                    className="text-primary font-bold py-2 px-4 rounded-full border border-primary hover:bg-primary hover:text-white transition-all duration-300 ease-in-out text-sm whitespace-nowrap"
                    onClick={() => {
                      handleSelectObjectiveAnswer(
                        answer.answer,
                        answer.answerTranslated,
                        answer.nextScenario,
                        answer.hc
                      );
                    }}
                  >
                    {answer.answerTranslated}
                  </button>
                ))}
              </div>
            </div>
          )
      }

      <div
        className={`p-1 w-full bg-white max-w-[770px] rounded-lg border mt-4 ${
          messageState.currentScenario === Scenario.ENTER_CAPACITY &&
          messageState.teller === "user" &&
          messageState.questionType === "subjective"
            ? "border border-primary"
            : "border border-gray-200"
        }`}
      >
        <form
          onSubmit={
            choosenMt === "Non-Fired Soil Brick"
              ? sendMessageBrick
              : sendMessage
          }
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 rounded outline-none"
            value={inputValue}
            onChange={handleInputChange}
            disabled={
              !(
                (messageState.currentScenario === Scenario.ENTER_GENERATION ||
                  messageState.currentScenario === Scenario.ENTER_HOURS ||
                  messageState.currentScenario === Scenario.ENTER_DAYS ||
                  messageState.currentScenario ===
                    Scenario.ENTER_PER_DAY_BRICK ||
                  messageState.currentScenario ===
                    Scenario.ENTER_BASELINE_WORKDAYS ||
                  messageState.currentScenario ===
                    Scenario.ENTER_BASELINE_ELECTRICITY ||
                  messageState.currentScenario ===
                    Scenario.ENTER_BASELINE_DIESEL ||
                  messageState.currentScenario ===
                    Scenario.ENTER_PROJECT_WORKDAYS ||
                  messageState.currentScenario ===
                    Scenario.ENTER_PROJECT_ELECTRICITY ||
                  messageState.currentScenario ===
                    Scenario.ENTER_UTILIZATION_RATE) &&
                messageState.teller === "user" &&
                messageState.questionType === "subjective"
              )
            }
          />
          <button
            type="submit"
            className="text-white font-bold py-2 px-4 rounded"
            disabled={!inputValue}
          >
            {(messageState.currentScenario === Scenario.ENTER_GENERATION ||
              messageState.currentScenario === Scenario.ENTER_HOURS ||
              messageState.currentScenario === Scenario.ENTER_DAYS ||
              messageState.currentScenario === Scenario.ENTER_PER_DAY_BRICK ||
              messageState.currentScenario ===
                Scenario.ENTER_BASELINE_WORKDAYS ||
              messageState.currentScenario ===
                Scenario.ENTER_BASELINE_ELECTRICITY ||
              messageState.currentScenario === Scenario.ENTER_BASELINE_DIESEL ||
              messageState.currentScenario ===
                Scenario.ENTER_PROJECT_WORKDAYS ||
              messageState.currentScenario ===
                Scenario.ENTER_PROJECT_ELECTRICITY ||
              messageState.currentScenario ===
                Scenario.ENTER_UTILIZATION_RATE) &&
            messageState.teller === "user" &&
            messageState.questionType === "subjective" ? (
              <Image
                src="/cal/icon_send_on.png"
                alt="Send"
                width={40}
                height={40}
              />
            ) : (
              <Image
                src="/cal/icon_send.png"
                alt="Send"
                width={40}
                height={40}
              />
            )}
          </button>
        </form>
      </div>
      {
        // 서버가 생각중일 때
        messageState.isServerThinking && (
          <div
            className="
            fixed
            bottom-0
            top-0
            left-0
            right-0
            p-4
            flex
            items-center
            justify-center
            gap-4
            flex-col
          "
          >
            <InfinitySpin color="#05B99C" />
            <span className="text-primary font-bold">
              Common Carbon AI is thinking...
            </span>
          </div>
        )
      }
    </main>
  );
}
