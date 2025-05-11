"use client";

import { useEffect, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { FixedSizeList as List } from "react-window";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFControls } from "./PDFControls";
import { usePDFStore } from "@/store/pdfStrore";
import { pdfFileSchema } from "@/lib/zodSchemas";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFView() {
  const [dragging, setDragging] = useState(false);
  const {
    file,
    fileName,
    numPages,
    pageNum,
    zoom,
    setPdf,
    setPdfName,
    setNumPages,
    setPageNum,
    setUploading,
  } = usePDFStore();
  const listRef = useRef<List>(null);

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

  const [listHeight, setListHeight] = useState(800);

  useEffect(() => {
    const handleResize = () => setListHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    listRef.current?.scrollToItem(pageNum - 1, "start");
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
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              <List
                height={listHeight}
                itemCount={numPages}
                itemSize={listHeight + 450 * zoom}
                width={860}
                ref={listRef}
                className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-red-100/40"
              >
                {({ index, style }) => (
                  <div style={style}>
                    <Page pageNumber={index + 1} width={840 * zoom} />
                  </div>
                )}
              </List>
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
