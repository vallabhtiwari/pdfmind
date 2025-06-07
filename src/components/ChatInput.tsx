import { MessageFrom } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import { usePDFStore } from "@/store/pdfStrore";
import axios from "axios";
import { v4 as uuid4 } from "uuid";
import { Mic, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ChatInput() {
  const [messageText, setMessageText] = useState("");
  const [chatting, setChatting] = useState(false);

  const pdfID = usePDFStore((s) => s.pdfID);
  const addChat = useChatStore((s) => s.addChat);
  const removeChat = useChatStore((s) => s.removeChat);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessageText(e.target.value);

  const sendMessage = async (message: string) => {
    if (chatting) return;
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
      setChatting(true);
      const response = await fetch("/api/retrieve", {
        method: "POST",
        body: JSON.stringify({ query: message, pdfID }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData?.error || "Something went wrong. Please try again.";
        throw new Error(errorMessage);
      }

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
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      removeChat(botMessage.id);
    } finally {
      setChatting(false);
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
