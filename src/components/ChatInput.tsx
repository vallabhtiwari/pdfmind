import { MessageFrom } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import { usePDFStore } from "@/store/pdfStrore";
import axios from "axios";
import { v4 as uuid4 } from "uuid";
import { Mic, Send } from "lucide-react";
import { useState } from "react";

export function ChatInput() {
  const [messageText, setMessageText] = useState("");
  const pdfID = usePDFStore((s) => s.pdfID);
  const addChat = useChatStore((s) => s.addChat);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessageText(e.target.value);

  const sendMessage = async (message: string) => {
    setMessageText("");
    if (!message || message === "") return;
    const userMessage = {
      id: uuid4(),
      message: message,
      from: "user" as const,
    };
    addChat(userMessage);

    // Add initial empty bot message
    const botMessage = {
      id: uuid4(),
      message: "",
      from: "bot" as const,
    };
    addChat(botMessage);

    try {
      const response = await fetch("/api/retrieve", {
        method: "POST",
        body: JSON.stringify({ query: message, pdfID }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulated += chunk;

        useChatStore.setState((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === botMessage.id ? { ...chat, message: accumulated } : chat
          ),
        }));
      }
    } catch (err) {
      console.error("Streaming error", err);
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === botMessage.id
            ? {
                ...chat,
                message: "Sorry, something went wrong. Please try again.",
              }
            : chat
        ),
      }));
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageText);
    }
  };
  return (
    <div className="bg-amber-50 flex justify-evenly items-center p-4 gap-4 h-18">
      <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
        <Mic />
      </div>
      <div className="flex-1">
        <textarea
          rows={1}
          className="bg-white border border-gray-400 w-full text-xl p-1 rounded-sm outline-none resize-none"
          value={messageText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
        <Send onClick={() => sendMessage(messageText)} />
      </div>
    </div>
  );
}
