import { ChatsType, Message } from "@/lib/types";
import { create } from "zustand";

export type ChatState = {
  chats: ChatsType;
};

export type ChatActions = {
  setChats: (chats: ChatsType | []) => void;
  addChat: (message: Message) => void;
  removeChat: (id: string) => void;
};

export type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  setChats: (chats) => set({ chats }),
  addChat: (message) => set((state) => ({ chats: [...state.chats, message] })),
  removeChat: (id) =>
    set((state) => ({ chats: state.chats.filter((chat) => chat.id !== id) })),
}));
