"use client";
import { pdfFileSchema } from "@/lib/zodSchemas";
import { useEffect, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFControls } from "./PDFControls";
import { usePDFStore } from "@/store/pdfStrore";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFView() {
  const [dragging, setDragging] = useState(false);
  const {
    file,
    fileName,
    numPages,
    pageNum,
    setPdf,
    setPdfName,
    setNumPages,
    setPageNum,
    setUploading,
  } = usePDFStore();
  const pageRefs = useRef<HTMLDivElement[]>([]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    setUploading(true);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const parsedFile = pdfFileSchema.safeParse({
        file: e.dataTransfer.files[0],
      });
      if (parsedFile.success) {
        setPdf(parsedFile.data.file);
        setPdfName(parsedFile.data.file.name);
      }
    }
    setUploading(false);
  };

  function onDocumentLoadSuccess({
    numPages: numberOfPages,
  }: {
    numPages: number;
  }): void {
    if (numberOfPages > 0) {
      setNumPages(numberOfPages);
      setPageNum(1);
    }
  }
  useEffect(() => {
    const pageIndex = pageNum - 1;
    const pageElement = pageRefs.current[pageIndex];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pageNum]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-red-100/40">
      <div className="text-center p-4 bg-red-100/40">{fileName}</div>
      <div
        className="flex-1 overflow-hidden flex flex-col"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex-1 overflow-hidden bg-red-100/40 flex flex-col items-center">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex-1 overflow-auto flex flex-col items-center gap-10 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-red-100/40 min-w-fit"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (el) pageRefs.current[index] = el;
                  }}
                >
                  <Page pageNumber={index + 1} width={820} />
                </div>
              ))}
            </Document>
          </div>
        ) : (
          <div
            className={`flex-1 bg-red-100/40 flex flex-col justify-center items-center ${
              dragging && "text-gray-400 bg-red-100"
            }`}
          >
            Click on Upload, or drop a PDF here.
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-6 bg-red-100/40"></div>
      <PDFControls />
    </div>
  );
}
