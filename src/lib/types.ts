export type PDFFile = string | File | null;

export type MessageFrom = "bot" | "user";

export type Message = {
  id: string;
  message: string;
  from: MessageFrom;
};

export type ChatsType = Message[];
