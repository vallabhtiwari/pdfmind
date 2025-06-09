import Image from "next/image";
import { PDFView } from "@/components/pdf/PDFView";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Navbar } from "@/components/Navbar";
export default function HomePage() {
  return (
    <main className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 grid grid-cols-2 overflow-hidden">
        <PDFView />
        <ChatWindow />
      </div>
    </main>
  );
}
