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
}

export default function Home() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputOnFocus, setInputOnFocus] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<MessageState>({
    teller: "server",
    isTyping: false,
    questionType: "objective",
  });
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
          className="flex-1 p-4 overflow-y-auto flex-col flex"
          ref={scrollRef}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-white text-primary font-bold self-end text-right rounded-tr-none border border-gray-400 shadow-sm"
                  : "bg-primary text-black self-start rounded-tl-none bg-opacity-20 shadow-sm"
              } inline-block max-w-[70%] break-words`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>
      <div
        className={`p-4 w-full bg-white max-w-[770px] rounded-lg border mt-4 ${
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
