"use client";
import Image from "next/image";
import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";

interface IMessage {
  id: number;
  text: string;
  sender: "user" | "server";
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
}

interface ObjectiveAnswer {
  answer: string;
  nextScenario: Scenario;
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
    isServerThinking: false,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRequestGreeting, setIsRequestGreeting] = useState<boolean>(false);
  const [objectiveAnswers, setObjectiveAnswers] = useState<ObjectiveAnswer[]>(
    []
  );

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMessage: IMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };
    setMessages([...messages, newMessage]);

    setTimeout(() => {
      const reply: IMessage = {
        id: Date.now(),
        text: "This is a simulated response.",
        sender: "server",
      };
      setMessages((currentMessages) => [...currentMessages, reply]);
    }, 1000);

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
          console.log("value>>>>>", value);
          if (done) {
            // console.log("Stream done.", chunks.join(""));
            const message: IMessage = {
              id: Date.now(),
              text: chunks.join(""),
              sender: "server",
            };
            setMessages((currentMessages) => [...currentMessages, message]);
            setMessageState((prev) => ({
              ...prev,
              teller: "user",
              isTyping: true,
            }));
            setMessages((currentMessages) => [
              ...currentMessages,
              { id: Date.now(), text: "", sender: "user" },
            ]);
            getGreetingObjectiveAnswers();

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
              setMessages((currentMessages) => [
                ...currentMessages,
                { id: Date.now(), text: parts[i], sender: "server" },
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

  const handleSelectGreetingObjectiveAnswer = async (
    answer: string,
    nextScenario: Scenario
  ) => {
    setMessageState((prev) => ({
      ...prev,
      teller: "server",
      isTyping: true,
      questionType: "objective",
      currentScenario: nextScenario,
    }));
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now(), text: answer, sender: "user" },
    ]);
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
              key={message.id}
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
                      handleSelectGreetingObjectiveAnswer(
                        answer.answer,
                        answer.nextScenario
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
          inputOnFocus ? "border border-primary" : "border border-gray-200"
        }`}
      >
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 rounded outline-none"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setInputOnFocus(true)}
            onBlur={() => setInputOnFocus(false)}
          />
          <button
            type="submit"
            className="text-white font-bold py-2 px-4 rounded"
            disabled={!inputValue}
          >
            {inputOnFocus ? (
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
    </main>
  );
}
