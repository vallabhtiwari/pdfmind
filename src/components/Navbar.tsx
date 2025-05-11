"use client";

import { pdfFileSchema } from "@/lib/zodSchemas";
import { usePDFStore } from "@/store/pdfStrore";
import { Upload, User } from "lucide-react";

export function Navbar() {
  const { setPdf, setPdfName, uploading, setUploading } = usePDFStore();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    if (e.target.files && e.target.files[0]) {
      const parsedFile = pdfFileSchema.safeParse({ file: e.target.files[0] });
      if (parsedFile.success) {
        setPdf(parsedFile.data.file);
        setPdfName(parsedFile.data.file.name);
      }
    }
    setUploading(false);
  };
  return (
    <nav className="flex justify-between items-center h-18 bg-amber-50">
      <div className="flex-1 p-2 text-2xl font-mono">PDFMind</div>
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
