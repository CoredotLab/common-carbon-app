"use client";
import { randomInt } from "crypto";
import Image from "next/image";
import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { InfinitySpin } from "react-loader-spinner";
import shortid from "shortid";

interface IMessage {
  id: number;
  text?: string;
  sender: "user" | "server";
  type?: "image" | "button"; // null 이면 text
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

    const lastMessage = messages[messages.length - 1];
    lastMessage.text = inputValue + " MWh/year";
    setMessages((prev) => [...prev.slice(0, -1), lastMessage]);
    // 마지막 메시지 없애고, 사용자 메시지 추가
    setMessageState((prev) => ({
      ...prev,
      teller: "server",
      isTyping: false,
    }));
    setInputValue("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const fetchGreeting = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/greeting`);
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
      console.log("Fetching greeting...");
      const stream = await fetchGreeting();
      const reader = stream.getReader();
      const chunks: string[] = [];

      function read() {
        reader.read().then(({ done, value }) => {
          chunks.push(value);
          const text = chunks.join("");
          // console.log("text 222>> ", text);
          // console.log("value>>>>>", value);
          if (done) {
            // console.log("Stream done.", chunks.join(""));
            const message: IMessage = {
              id: Date.now() + 1,
              text: chunks.join(""),
              sender: "server",
            };
            // time delay
            setTimeout(() => {
              setMessages((currentMessages) => [...currentMessages, message]);
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
          if (text.includes("\n")) {
            const parts = text.split("\n");
            const part_length = parts.length;
            // console.log("parts.length", part_length);
            for (let i = 0; i < part_length - 1; i++) {
              if (parts[i].trim() === "") {
                continue;
              }
              // console.log("parts[i]", parts[i]);
              if (i === 0) {
                setMessageState((prev) => ({
                  ...prev,
                  isServerThinking: false,
                }));
              }
              setMessages((currentMessages) => [
                ...currentMessages,
                { id: Date.now() + i, text: parts[i], sender: "server" },
              ]);
            }
            chunks.length = 0;
            if (parts[part_length - 1].trim() === "") {
            } else {
              chunks.push(parts[part_length - 1]);
            }
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
      setChoosenMt(answer);
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
  };

  const fetchSelectHcMtDesc = async (hc_name: string, mt_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selectmt/desc?hc=${hc_name}&mt=${mt_name}`
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

    function read() {
      reader.read().then(({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          const message: IMessage = {
            id: Date.now() + 1,
            text: chunks.join(""),
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, message]);
          handleEnterCapacity(hc_name, mt_name);
          return;
        }
        if (text.includes("\n")) {
          const parts = text.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: Date.now() + i, text: parts[i], sender: "server" },
            ]);
          }
          chunks.length = 0;
          if (parts[part_length - 1].trim() === "") {
          } else {
            chunks.push(parts[part_length - 1]);
          }
        }

        read();
      });
    }

    read();
  };

  const fetchSelectHcDesc01 = async (hc_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selecthc/desc01?hc=${hc_name}`
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

    function read() {
      reader.read().then(async ({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          const message: IMessage = {
            id: Date.now() + 1,
            text: chunks.join(""),
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, message]);
          await handleFetchSelectHcDesc02(hc_name);

          return;
        }
        if (text.includes("\n")) {
          const parts = text.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: Date.now() + i, text: parts[i], sender: "server" },
            ]);
          }
          chunks.length = 0;
          if (parts[part_length - 1].trim() === "") {
          } else {
            chunks.push(parts[part_length - 1]);
          }
        }

        read();
      });
    }

    read();
  };

  const fetchSelectHcDesc02 = async (hc_name: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/selecthc/desc02?hc=${hc_name}`
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

    setMessageState((prev) => ({
      ...prev,
      isServerThinking: false,
    }));

    function read() {
      reader.read().then(({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          const message: IMessage = {
            id: Date.now() + 1,
            text: chunks.join(""),
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, message]);
          setTimeout(() => {
            setMessages((currentMessages) => [...currentMessages, message]);
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
        if (text.includes("\n")) {
          const parts = text.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: Date.now() + i, text: parts[i], sender: "server" },
            ]);
          }
          chunks.length = 0;
          if (parts[part_length - 1].trim() === "") {
          } else {
            chunks.push(parts[part_length - 1]);
          }
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

  const fetchDontKnowAnything = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/greeting/dont-know-anything`
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

    function read() {
      reader.read().then(({ done, value }) => {
        chunks.push(value);
        const text = chunks.join("");
        if (done) {
          const message: IMessage = {
            id: Date.now() + 1,
            text: chunks.join(""),
            sender: "server",
          };
          setMessages((currentMessages) => [...currentMessages, message]);
          addCimImageToMessages();
          addCimHrefToMessages();
          return;
        }
        if (text.includes("\n")) {
          const parts = text.split("\n");
          const part_length = parts.length;
          for (let i = 0; i < part_length - 1; i++) {
            if (parts[i].trim() === "") {
              continue;
            }
            setMessageState((prev) => ({
              ...prev,
              isServerThinking: false,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: Date.now() + i, text: parts[i], sender: "server" },
            ]);
          }
          chunks.length = 0;
          if (parts[part_length - 1].trim() === "") {
          } else {
            chunks.push(parts[part_length - 1]);
          }
        }

        read();
      });
    }

    read();
  };

  const addCimImageToMessages = () => {
    const cimImageMessage: IMessage = {
      id: Date.now(),
      text: "The Carbon Impact Map (CIM) is a global map showcasing the current carbon reduction efforts worldwide, offering a detailed view of each country's carbon reductions by technology.",
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
      type: "button",
      desc: "/en/cim",
    };
    setMessages((currentMessages) => [...currentMessages, cimHrefMessage]);
  };

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
          {messages.map((message) => (
            <div
              key={shortid.generate()}
              className={`p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-white text-primary font-bold self-end text-right rounded-tr-none border border-gray-300 shadow-lg"
                  : "bg-primary text-black self-start rounded-tl-none bg-opacity-20 shadow-lg"
              } inline-block max-w-[70%] break-words`}
            >
              {message.sender === "user" && messageState.isTyping && (
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
                // 버튼 메시지
                message.type === "button" && (
                  <a
                    href={message.desc as string}
                    target="_blank"
                    className="text-white font-bold py-2 px-4 rounded-[10px] border border-primary bg-primary hover:bg-white hover:text-primary transition-all duration-300 ease-in-out text-sm"
                  >
                    Learn more
                  </a>
                )
              }
              {message.text}
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
