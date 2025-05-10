import { ChevronDown, ChevronUp, ZoomIn, ZoomOut } from "lucide-react";

export function PDFControls() {
  const value = "2";
  return (
    <div className="bg-amber-50 flex justify-between items-center p-4 h-18 border-r border-gray-200">
      <div className="flex justify-evenly items-center gap-2">
        <div className="cursor-pointer">
          <ChevronUp />
        </div>
        <div>
          <input
            type="text"
            className="bg-white border border-gray-400 text-xl text-center px-1 rounded-sm outline-none"
            style={{ width: `${Math.max(2, value.length) + 1}ch` }}
            value={value}
          />
        </div>
        <div className="">
          <span>/ 10</span>
        </div>
        <div className="cursor-pointer">
          <ChevronDown />
        </div>
      </div>
      <div className="flex justify-evenly items-center gap-1">
        <div className="cursor-pointer">
          <ZoomOut />
        </div>
        <div className="flex justify-evenly cursor-pointer hover:bg-gray-50 p-1 hover:border hover:border-gray-200 rounded-md">
          <span>100%</span>
          <div>
            <ChevronDown />
          </div>
        </div>

        <div className="cursor-pointer">
          <ZoomIn />
        </div>
      </div>
    </div>
  );
}
