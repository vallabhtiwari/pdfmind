import { pageNumSchema } from "@/lib/zodSchemas";
import { usePDFStore } from "@/store/pdfStrore";
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function PDFControls() {
  const pageNum = usePDFStore((s) => s.pageNum);
  const numPages = usePDFStore((s) => s.numPages);
  const setPageNum = usePDFStore((s) => s.setPageNum);
  const zoom = usePDFStore((s) => s.zoom);
  const setZoom = usePDFStore((s) => s.setZoom);
  const pageNumInput = usePDFStore((s) => s.pageNumInput);
  const [showZoomLevels, setShowZoomLevels] = useState(false);
  const zoomLevels = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5];
  const dropDownRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);

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
    if (numPages > 0 && pageNum <= numPages) {
      setPageNum(pageNum + 1);
      setInputValue((pageNum + 1).toString());
    }
  };

  const goToPrevPage = () => {
    if (numPages > 0 && pageNum > 1) {
      setPageNum(pageNum - 1);
      setInputValue((pageNum - 1).toString());
    }
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(Math.round((prev + 0.1) * 10) / 10, 1.5));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(Math.round((prev - 0.1) * 10) / 10, 0.5));
  };

  useEffect(() => setInputValue(pageNum.toString()), [pageNum]);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropDownRef.current &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(e.target as Node) &&
        !dropDownRef.current.contains(e.target as Node)
      )
        setShowZoomLevels(false);
    }
    if (showZoomLevels)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showZoomLevels]);

  return (
    <div className="bg-amber-50 flex justify-between items-center p-4 h-18 border-r border-gray-200">
      <div className="flex justify-evenly items-center gap-2">
        <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
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
        <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
          <ChevronDown onClick={goToNextPage} />
        </div>
      </div>
      <div className="flex justify-evenly items-center gap-1">
        <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
          <ZoomOut onClick={zoomOut} />
        </div>
        <div className="relative">
          <div className="flex justify-evenly cursor-pointer hover:bg-gray-100 p-1 hover:border hover:border-gray-200 rounded-md">
            <div
              ref={toggleButtonRef}
              onClick={() => {
                if (numPages) setShowZoomLevels((prev) => !prev);
              }}
              className="flex justify-evenly items-center"
            >
              <span>{Math.round(zoom * 100)}%</span>
              <ChevronDown />
            </div>
            {showZoomLevels && (
              <div
                ref={dropDownRef}
                className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded shadow-md z-10"
              >
                {zoomLevels.map((level) => (
                  <div
                    key={level}
                    onClick={() => {
                      setZoom(level);
                      setShowZoomLevels(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {Math.round(level * 100)}%
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-1 cursor-pointer hover:bg-gray-100 hover:border hover:border-gray-200 rounded-md">
          <ZoomIn onClick={zoomIn} />
        </div>
      </div>
    </div>
  );
}
