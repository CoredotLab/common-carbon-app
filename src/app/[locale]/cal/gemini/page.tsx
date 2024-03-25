"use client";
import { randomInt } from "crypto";
import Image from "next/image";
import {
  useState,
  FormEvent,
  ChangeEvent,
  useEffect,
  useRef,
  use,
} from "react";
import { InfinitySpin } from "react-loader-spinner";
import shortid from "shortid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { t } from "i18next";
import { get } from "http";

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
}

interface ObjectiveAnswer {
  answer: string;
  nextScenario: Scenario;
  hc?: string;
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
  const [htmlTxt, setHtmlTxt] = useState<string>("");

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() === "") {
      return;
    }
    // only digit
    if (messageState.currentScenario === Scenario.ENTER_CAPACITY) {
      if (!/^\d+$/.test(inputValue)) {
        alert("Please enter only numbers.");
        return;
      }
    }
    // console.log("inputValue", inputValue);
    setChoosenCapacity((prev) => inputValue);

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

  const handleShowPdd = async (capacity: string) => {
    // 먼저 안내
    const message1: IMessage = {
      id: Date.now(),
      text: "Congratulations on successfully completing all the questions! Please be patient just a little longer as I am now compiling the results for you.",
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, message1]);
    setTimeout(() => {
      const message2: IMessage = {
        id: Date.now(),
        text: "PDD Report (Partial): A preliminary overview of your project's design document.",
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
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/greeting`
    );
    const reader = response.body?.getReader();

    return new ReadableStream({
      async start(controller) {
        function push() {
          reader?.read().then(({ done, value }) => {
            // console.log("value>> ", value);
            if (done) {
              controller.close();
              return;
            }
            const text = new TextDecoder().decode(value);

            // console.log("text >> ", text);

            controller.enqueue(text);
            push();
          });
        }
        push();
      },
    });
  };

  useEffect(() => {
    if (isRequestGreeting) {
      return;
    }
    setIsRequestGreeting(true);
    const handleFetchGreeting = async () => {
      // console.log("Fetching greeting...");
      const stream = await fetchGreeting();
      const reader = stream.getReader();
      const chunks: string[] = [];
      if (messages.length === 0) {
        // console.log("if here?");
        const emptyMessage: IMessage = {
          id: Date.now(),
          text: "",
          sender: "server",
        };
        setMessages((currentMessages) => [...currentMessages, emptyMessage]);
      }

      function read() {
        reader.read().then(({ done, value }) => {
          // console.log("value>> ", value, typeof value);
          chunks.push(value);
          const text = chunks.join("");
          // console.log("text 222>> ", text);
          // console.log("value>>>>>", value);
          if (done) {
            // console.log("Stream done.", chunks.join(""));

            // time delay
            setTimeout(() => {
              const chooseHostCountryOrNotMessage: IMessage = {
                id: Date.now() + 2,
                text: "Do you know where you want to host your project?",
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
            // console.log("enter");
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
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getGreetingObjectiveAnswers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/greeting/objective`
    );
    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const handleSelectObjectiveAnswer = async (
    answer: string,
    nextScenario: Scenario,
    hc?: string
  ) => {
    // 사용자 마지막 답변을 선택한 답변으로 변경 처리
    const lastMessage = messages[messages.length - 1];
    lastMessage.text = answer;
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
        text: "Please select the mitigation technology you are interested in. Available mitigation technologies are Solar for now.",
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
      handleFetchSelectHcMtDesc(hc as string, answer);
      setChoosenMt(answer);
    }

    if (nextScenario === Scenario.ENTER_CAPACITY_2) {
      // 용량 입력
      setChoosenHc(answer);
      handleFetchSelectHcMtDesc(answer, choosenMt === "" ? "Solar" : choosenMt);
    }
  };

  const fetchSelectMtRecommendHc = async (mt_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selectmt/recommendhc?mt=${mt_name}`
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
          setTimeout(() => {
            const chooseHostCountry: IMessage = {
              id: Date.now() + 2,
              text: "Please select the host country you are interested in.",
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
          // console.log("enter");
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

  const handleEnterCapacity = async (hc: string, mt: string) => {
    const message: IMessage = {
      id: Date.now(),
      text: "Please enter the solar power capacity of the project. Please enter the capacity in MWh/year.",
      sender: "server",
    };
    setMessages((currentMessages) => [...currentMessages, message]);
    setMessageState((prev) => ({
      ...prev,
      teller: "user",
      isTyping: true,
      questionType: "subjective",
      currentScenario: Scenario.ENTER_CAPACITY,
    }));
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now() + 3, text: "", sender: "user" },
    ]);
  };

  const fetchSelectHcMtDesc = async (hc_name: string, mt_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selectmt/desc?hc=${hc_name}&mt=${mt_name}`
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
            handleEnterCapacity(hc_name, mt_name);
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
          // console.log("enter");
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
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selecthc/desc01?hc=${hc_name}`
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
          // console.log("enter");
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
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/selecthc/desc02?hc=${hc_name}`
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
          setTimeout(() => {
            const chooseMitigationTechnology: IMessage = {
              id: Date.now() + 2,
              text: "This mitigation technology is available in the following countries. Please select the mitigation technology you are interested in.",
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
          // console.log("enter");
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
      `${process.env.NEXT_PUBLIC_API_URL}/selecthc/objective?hc=${hc}`
    );

    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const getSelectMtObjectiveAnswers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selectmt/objective`
    );

    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const getSelectMtRecommendHcObjectiveAnswers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selectmt/recommendhc/objective`
    );

    const data = await response.json();
    setObjectiveAnswers(data);
  };

  const fetchDontKnowAnything = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gemini/greeting/dont-know-anything`
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
          // console.log("enter");
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

  const addCimDescToMessages = () => {
    const cimDescMessage: IMessage = {
      id: Date.now(),
      text: "The Carbon Impact Map (CIM) is a global map showcasing the current carbon reduction efforts worldwide, offering a detailed view of each country's carbon reductions by technology.",
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
    // console.log("choosenCapacity", choosenCapacity, capacity);
    const capacityValue = choosenCapacity === "" ? capacity : choosenCapacity;
    // fetch from server
    const url = `${process.env.NEXT_PUBLIC_API_URL}/example?hc=${choosenHc}&mt=${choosenMt}&capacity=${capacityValue}`;

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

  // useEffect(() => {
  //   addSampleHtmlTxtToMessages();
  // }, []);

  const downloadPdfFromHtml = async (capacity: string) => {
    const capacityValue = choosenCapacity === "" ? capacity : choosenCapacity;
    // const url = `${process.env.NEXT_PUBLIC_API_URL}/example?hc=${choosenHc}&mt=${choosenMt}&capacity=${capacityValue}`;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/example?hc=Vietnam&mt=Solar&capacity=100000`; // sample

    // 서버에서 HTML 콘텐츠를 가져옵니다.
    const response = await fetch(url);
    const htmlContent = await response.text();

    // HTML 콘텐츠를 담을 임시 div를 생성합니다.
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    // tempDiv.style.visibility = "hidden";
    // tempDiv.style.opacity = "0";
    document.body.appendChild(tempDiv); // 문서에 임시 div를 추가

    // html2canvas를 사용하여 HTML을 캔버스로 변환합니다.
    html2canvas(tempDiv).then((canvas) => {
      // 캔버스를 이미지 데이터로 변환합니다.
      const imgData = canvas.toDataURL("image/png");

      // jsPDF 인스턴스를 생성합니다.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [canvas.width * 0.264583, canvas.height * 0.264583], // 캔버스 크기를 mm 단위로 변환
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight()
      );

      // PDF를 다운로드합니다.
      pdf.save("download.pdf");

      // 임시 div를 문서에서 제거합니다.
      document.body.removeChild(tempDiv);
    });
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
    } catch (error) {
      // console.error("There was an error!", error);
    }
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
                        downloadPdfFromServer(choosenCapacity);
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
              {message.type === undefined && (
                <div className="text-md">{message.text}</div>
              )}
              {/* {message.text} */}
            </div>
          ))}
        </div>
      </div>
      {
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
                        answer.nextScenario,
                        answer.hc
                      );
                    }}
                  >
                    {answer.answer}
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
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 rounded outline-none"
            value={inputValue}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="text-white font-bold py-2 px-4 rounded"
            disabled={!inputValue}
          >
            {messageState.currentScenario === Scenario.ENTER_CAPACITY &&
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
