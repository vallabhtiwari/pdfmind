"use client";

import { pdfFileSchema } from "@/lib/zodSchemas";
import { useChatStore } from "@/store/chatStore";
import { usePDFStore } from "@/store/pdfStrore";
import axios, { AxiosError } from "axios";
import { Upload, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function Navbar() {
  const setPdf = usePDFStore((s) => s.setPdf);
  const setPdfName = usePDFStore((s) => s.setPdfName);
  const uploading = usePDFStore((s) => s.uploading);
  const setUploading = usePDFStore((s) => s.setUploading);
  const setPdfID = usePDFStore((s) => s.setPdfID);
  const setChats = useChatStore((s) => s.setChats);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    const fileInput = e.target;
    if (e.target.files && e.target.files[0]) {
      const parsedFile = pdfFileSchema.safeParse({ file: e.target.files[0] });
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
    fileInput.value = "";
    setUploading(false);
  };
  return (
    <nav className="flex justify-between items-center h-18 bg-amber-50">
      <Link className="flex-1 p-2 text-2xl font-mono" href="/">
        PDFMind
      </Link>
      <div className="w-1/6 flex justify-end gap-32 p-4">
        <div className="flex justify-evenly items-center">
          <label className="flex justify-evenly items-center gap-2 cursor-pointer bg-orange-400 hover:bg-orange-600 text-white text-xl font-semibold py-2 px-4 rounded-sm">
            <Upload /> <span className="font-mono">Upload</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
        <div className="cursor-pointer flex justify-evenly items-center">
          <User className="size-10 hover:text-orange-600" />
        </div>
      </div>
    </nav>
  );
}
