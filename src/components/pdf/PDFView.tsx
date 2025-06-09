"use client";

import { memo, useEffect, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { FixedSizeList as List } from "react-window";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFControls } from "./PDFControls";
import { usePDFStore } from "@/store/pdfStrore";
import { pdfFileSchema } from "@/lib/zodSchemas";
import axios, { AxiosError } from "axios";
import { useChatStore } from "@/store/chatStore";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchLimits } from "@/utils/client";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFView() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const file = usePDFStore((s) => s.file);
  const fileName = usePDFStore((s) => s.fileName);
  const numPages = usePDFStore((s) => s.numPages);
  const pageNum = usePDFStore((s) => s.pageNum);
  const zoom = usePDFStore((s) => s.zoom);
  const setPdf = usePDFStore((s) => s.setPdf);
  const setPdfName = usePDFStore((s) => s.setPdfName);
  const setNumPages = usePDFStore((s) => s.setNumPages);
  const setPageNum = usePDFStore((s) => s.setPageNum);
  const setUploading = usePDFStore((s) => s.setUploading);
  const setPageNumberInput = usePDFStore((s) => s.setPageNumberInput);
  const setZoom = usePDFStore((s) => s.setZoom);
  const setPdfID = usePDFStore((s) => s.setPdfID);
  const setChats = useChatStore((s) => s.setChats);

  const listRef = useRef<List>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!file) {
      e.preventDefault();
      setDragging(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!file) {
      e.preventDefault();
      setDragging(false);
    }
  };
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (!session) {
      router.push("/auth");
      return;
    }
    const limitsUrl = "/api/user/limits";
    const { error, limits } = await fetchLimits(limitsUrl);
    if (limits) {
      if (
        limits?.monthlyCount >= limits?.monthlyLimit ||
        limits?.dailyCount >= limits?.dailyLimit
      ) {
        toast.error("Rate limit exceeded. Please try again later.");
        return;
      }
    }
    if (!file) {
      e.preventDefault();
      setDragging(false);
      setUploading(true);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const parsedFile = pdfFileSchema.safeParse({
          file: e.dataTransfer.files[0],
        });
        if (parsedFile.success) {
          const url = "/api/upload";
          try {
            const formData = new FormData();
            formData.append("file", parsedFile.data.file);
            const resp = await axios.request({
              method: "POST",
              url,
              data: formData,
            });
            const data = await resp.data;
            setPdfID(data.pdfID);
            setPdf(parsedFile.data.file);
            setPdfName(parsedFile.data.file.name);
            setChats([]);
          } catch (error) {
            setPdfID("");
            setPdf(null);
            setPdfName("");
            setChats([]);

            let err = "Something went wrong. Please try again.";
            if (error instanceof AxiosError) {
              if (typeof error.response?.data.error === "string") {
                err = error.response.data.error;
              }
            }
            toast.error(err);
          }
        }
      }
      setUploading(false);
    }
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

  useEffect(() => {
    if (file) {
      setZoom(1);
    }
  }, [file]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-red-100/40">
      <div className="text-center p-4 bg-red-100/40 font-mono">
        {fileName?.trim()}
      </div>
      <div
        className="flex-1  overflow-hidden flex flex-col"
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
                onItemsRendered={({ visibleStartIndex }) =>
                  setPageNumberInput((visibleStartIndex + 1).toString())
                }
                overscanCount={5}
                className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-red-100/40"
              >
                {({ index, style }) => (
                  <div style={style}>
                    <PDFPage pageNumber={index + 1} width={840 * zoom} />
                  </div>
                )}
              </List>
            </Document>
          </div>
        ) : (
          <div
            className={`flex-1 bg-red-100/40 flex flex-col justify-center items-center font-mono ${
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

const PDFPage = memo(
  ({ pageNumber, width }: { pageNumber: number; width?: number }) => {
    const [showTextLayer, setShowTextLayer] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
      timeoutRef.current = setTimeout(() => {
        setShowTextLayer(true);
      }, 500);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
    return (
      <Page
        pageNumber={pageNumber}
        width={width}
        renderTextLayer={showTextLayer}
      />
    );
  }
);
