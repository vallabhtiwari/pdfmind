import { PDFFile } from "@/lib/types";
import { create } from "zustand";

export type PDFState = {
  file: PDFFile;
  fileName: string | null;
  numPages: number;
  pageNum: number;
  uploading: boolean;
  zoom: number;
  pageNumInput: string;
};
export type PDFActions = {
  setPdf: (file: PDFFile) => void;
  removePdf: (file: PDFFile) => void;
  setPdfName: (name: string) => void;
  setNumPages: (num: number) => void;
  setPageNum: (num: number) => void;
  setUploading: (uploading: boolean) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPageNumberInput: (input: string) => void;
};

export type PDFStore = PDFState & PDFActions;

export const usePDFStore = create<PDFStore>((set) => ({
  file: null,
  fileName: null,
  uploading: false,
  pageNum: 0,
  numPages: 0,
  zoom: 1.0,
  pageNumInput: "0",
  setPdf: (file) => set({ file: file }),
  removePdf: (file) => set({ file: file }),
  setPdfName: (name) => set({ fileName: name }),
  setNumPages: (num) => set({ numPages: num }),
  setPageNum: (num) => set({ pageNum: num }),
  setUploading: (uploading) => set({ uploading }),
  setZoom: (updater) =>
    set((state) =>
      state.file
        ? {
            zoom: typeof updater === "function" ? updater(state.zoom) : updater,
          }
        : state
    ),
  setPageNumberInput: (input) => set({ pageNumInput: input }),
}));
