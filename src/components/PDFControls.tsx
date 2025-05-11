import { pageNumSchema } from "@/lib/zodSchemas";
import { usePDFStore } from "@/store/pdfStrore";
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";

export function PDFControls() {
  const { pageNum, numPages, setPageNum } = usePDFStore();
  const [inputValue, setInputValue] = useState("0");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const parsedNum = pageNumSchema.safeParse(Number(inputValue));
      if (parsedNum.success) {
        if (parsedNum.data <= numPages) setPageNum(parsedNum.data);
      }
    }
  };
  const goToNextPage = () => {
    if (pageNum <= numPages) {
      setPageNum(pageNum + 1);
      setInputValue((pageNum + 1).toString());
    }
  };

  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
      setInputValue((pageNum - 1).toString());
    }
  };

  useEffect(() => setInputValue(pageNum.toString()), [pageNum]);

  return (
    <div className="bg-amber-50 flex justify-between items-center p-4 h-18 border-r border-gray-200">
      <div className="flex justify-evenly items-center gap-2">
        <div className="cursor-pointer">
          <ChevronUp onClick={goToPrevPage} />
        </div>
        <div>
          <input
            type="text"
            className="bg-white border border-gray-400 text-xl text-center px-1 rounded-sm outline-none"
            style={{ width: `${Math.max(2, `${pageNum}`.length) + 1}ch` }}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            value={inputValue}
          />
        </div>
        <div className="">
          <span>/ {numPages}</span>
        </div>
        <div className="cursor-pointer">
          <ChevronDown onClick={goToNextPage} />
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
