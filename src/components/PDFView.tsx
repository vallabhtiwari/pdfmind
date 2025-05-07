"use client";
import { PDFFile } from "@/lib/types";
import { pdfFileSchema } from "@/lib/zodSchemas";
import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

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
    <div
      className="bg-red-100"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {file ? (
        <>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col justify-evenly items-center"
          >
            {Array.from(new Array(numPages), (_, index) => {
              return (
                <Page
                  key={index + 1}
                  pageNumber={index + 1}
                  width={870}
                  className="mt-8"
                />
              );
            })}
          </Document>
          <p>
            Page {pageNumber} of {numPages}
          </p>
        </>
      ) : (
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}
