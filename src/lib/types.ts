export type PDFFile = string | File | null;

export type MessageFrom = "bot" | "user";

export type Message = {
  id: string;
  message: string;
  from: MessageFrom;
  audioBlob?: Blob;
};

export type ChatsType = Message[];

export type VoiceMessageProps = {
  blob: Blob;
};

export type UserLimits = {
  dailyCount: number;
  monthlyCount: number;
  totalCount: number;
  dailyLimit: number;
  monthlyLimit: number;
};
