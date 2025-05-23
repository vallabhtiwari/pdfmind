import { Mic, Send } from "lucide-react";

export function ChatInput() {
  return (
    <div className="bg-amber-50 flex justify-evenly items-center p-4 gap-4 h-18">
      <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
        <Mic />
      </div>
      <div className="flex-1">
        <input
          type="text"
          className="bg-white border border-gray-400 w-full text-xl p-1 rounded-sm outline-none"
        />
      </div>
      <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
        <Send />
      </div>
    </div>
  );
}
