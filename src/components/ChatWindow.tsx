"use client";
import { useEffect, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { BotMessageSquare, User } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

export function ChatWindow() {
  const chats = useChatStore((s) => s.chats);
  const messageEndRef = useRef<HTMLDivElement>(null);
  useEffect(
    () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [chats.length]
  );
  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-green-100/40">
      <div className="text-center p-7 bg-green-100/40"></div>

      <div className="px-14 flex-1 overflow-hidden flex flex-col bg-green-100/40">
        {chats.length > 0 ? (
          <div className="flex-1 bg-white overflow-y-auto flex flex-col p-4 pb-0 gap-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-green-100/40">
            {chats.map((chat) => (
              <div
                key={chat.id}
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
        ) : (
          <div
            className={`flex-1 flex flex-col justify-center items-center font-mono`}
          >
            Your chats will appear here.
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-6 bg-green-100/40"></div>
      <ChatInput />
    </div>
  );
}
