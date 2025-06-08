import { useChatStore } from "@/store/chatStore";
import { usePDFStore } from "@/store/pdfStrore";
import { v4 as uuid4 } from "uuid";
import { Mic, Send } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function ChatInput() {
  const [messageText, setMessageText] = useState("");
  const [chatting, setChatting] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  // let silenceTimeout: ReturnType<typeof setTimeout>;

  const pdfID = usePDFStore((s) => s.pdfID);
  const addChat = useChatStore((s) => s.addChat);
  const removeChat = useChatStore((s) => s.removeChat);

  //--------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessageText(e.target.value);

  // common function to get response for both text and voice messages
  const getResponseFromServer = async (options: {
    message?: string;
    blob?: Blob;
  }) => {
    const { message, blob } = options;
    if (!message && !blob) return;

    const userMessage = {
      id: uuid4(),
      message: message || "",
      from: "user" as const,
      audioBlob: blob,
    };

    const botMessage = {
      id: uuid4(),
      message: "",
      from: "bot" as const,
    };

    addChat(userMessage);
    addChat(botMessage);
    setChatting(true);

    let requestInit: RequestInit;
    let url: string;

    if (blob) {
      const formData = new FormData();
      formData.append("file", blob, "message.webm");
      formData.append("pdfID", pdfID!);
      requestInit = {
        method: "POST",
        body: formData,
      };
      url = "/api/retrieve/voice";
    } else {
      requestInit = {
        method: "POST",
        body: JSON.stringify({ query: message, pdfID }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      url = "/api/retrieve";
    }

    try {
      const response = await fetch(url, requestInit);
      if (!response.ok || !response.body) {
        const errorData = await response.json();
        const errorMessage =
          errorData?.error || "Something went wrong. Please try again.";
        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        for (const char of chunk) {
          accumulated += char;

          useChatStore.setState((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === botMessage.id
                ? { ...chat, message: accumulated }
                : chat
            ),
          }));

          await new Promise((res) => setTimeout(res, 15));
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(errorMsg);
      removeChat(botMessage.id);
    } finally {
      setChatting(false);
    }
  };
  //--------------------------------------------------------------
  // handler for text messages
  const sendMessage = async (message: string) => {
    if (!pdfID) {
      toast.error("Please upload a pdf to start chatting.");
      return;
    }
    if (chatting) return;
    setMessageText("");
    if (!message || message === "") return;
    await getResponseFromServer({ message });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageText);
    }
  };
  //--------------------------------------------------------------
  // handler for voice messages
  const handleMicClick = async () => {
    if (!pdfID) {
      toast.error("Please upload a pdf to start chatting.");
      return;
    }
    if (isRecording) {
      stopRecording();
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];
    setIsRecording(true);

    mediaRecorder.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (!(blob instanceof Blob) || blob.size === 0) return;
      await getResponseFromServer({ blob });
    };

    mediaRecorder.start();
    // add 10s auto stop
  };
  const stopRecording = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  //--------------------------------------------------------------
  return (
    <div className="bg-amber-50 flex justify-evenly items-center p-4 gap-4 h-18">
      <div
        className={`p-1 cursor-pointer rounded-md hover:bg-gray-100 hover:border hover:border-gray-200 ${
          isRecording
            ? "bg-red-100 ring-2 ring-red-400 animate-pulse shadow-lg"
            : ""
        }`}
      >
        <Mic
          onClick={handleMicClick}
          className={isRecording ? "text-red-600" : ""}
        />
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
