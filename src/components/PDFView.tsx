"use client";
import { PDFFile } from "@/lib/types";
import { pdfFileSchema } from "@/lib/zodSchemas";
import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFControls } from "./PDFControls";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFView() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<PDFFile>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("Dragover");
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("DragLeave");
    e.preventDefault();
    setDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("Drop");
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const parsedFile = pdfFileSchema.safeParse({
        file: e.dataTransfer.files[0],
      });
      if (parsedFile.success) setFile(parsedFile.data.file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const parsedFile = pdfFileSchema.safeParse({ file: e.target.files[0] });
      if (parsedFile.success) setFile(parsedFile.data.file);
    }
  };
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-red-100/40">
      <div className="text-center p-4 bg-red-100/40">PDF Name</div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {file ? (
          <div className="flex-1 overflow-hidden bg-red-100/40 flex flex-col items-center">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex-1 overflow-y-auto flex flex-col items-center gap-10 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-red-100/40"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page key={index + 1} pageNumber={index + 1} width={820} />
              ))}
            </Document>
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center bg-red-100/40">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-6 bg-red-100/40"></div>
      <PDFControls />
    </div>
  );
}
