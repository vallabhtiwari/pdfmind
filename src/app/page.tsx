import Image from "next/image";
import { PDFView } from "@/components/PDFView";
import { ChatWindow } from "@/components/ChatWindow";
import { Navbar } from "@/components/Navbar";
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <div className="grid grid-cols-2 w-full h-screen">
        <PDFView />
        <ChatWindow />
      </div>
    </main>
  );
}
