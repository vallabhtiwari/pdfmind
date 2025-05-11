"use client";
import { useEffect, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { BotMessageSquare, User } from "lucide-react";

export function ChatWindow() {
  const sampleChats = [
    { id: 1, message: "Hello! 👋 How can I assist you today?", from: "bot" },
    { id: 2, message: "I need help with my account.", from: "user" },
    { id: 3, message: "Sure! Let me check that for you. 🔎", from: "bot" },
    { id: 4, message: "Thanks!", from: "user" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
    { id: 5, message: "You're welcome! 🎉", from: "bot" },
  ];
  const messageEndRef = useRef<HTMLDivElement>(null);
  useEffect(
    () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [sampleChats.length]
  );
  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-green-100/40">
      <div className="text-center p-7 bg-green-100/40"></div>

      <div className="px-14 flex-1 overflow-hidden flex flex-col bg-green-100/40">
        <div className="bg-white overflow-y-auto flex flex-col p-4 gap-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-green-100/40">
          {sampleChats.map((chat, index) => (
            <div
              key={chat.id + index}
              className={chat.from === "bot" ? " self-start" : "self-end"}
            >
              <div className="flex justify-evenly items-center gap-2">
                {chat.from === "bot" && <BotMessageSquare />}
                <span
                  className={`p-3 rounded-lg border border-gray-200 ${
                    chat.from === "bot" ? "bg-gray-50" : "bg-green-100/40"
                  }`}
                >
                  {chat.message}
                </span>
                {chat.from === "user" && <User />}
              </div>
            </div>
          ))}
          <div ref={messageEndRef}></div>
        </div>
      </div>
      <div className="flex items-center justify-between p-6 bg-green-100/40"></div>
      <ChatInput />
    </div>
  );
}
