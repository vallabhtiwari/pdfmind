import { ChatsType, Message } from "@/lib/types";
import { create } from "zustand";

export type ChatState = {
  chats: ChatsType;
};

export type ChatActions = {
  addChat: (message: Message) => void;
};

export type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  addChat: (message) => set((state) => ({ chats: [...state.chats, message] })),
}));
