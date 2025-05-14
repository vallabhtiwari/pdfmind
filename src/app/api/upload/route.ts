import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { pdfFileSchema } from "@/lib/zodSchemas";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const parsedFile = pdfFileSchema.safeParse({ file });
  if (!parsedFile.success) {
    return NextResponse.json({ error: "Invalid File" }, { status: 400 });
  }

  const buffer = Buffer.from(await parsedFile.data.file.arrayBuffer());
  const tempFilePath = path.join("/tmp", `${randomUUID()}.pdf`);
  await fs.writeFile(tempFilePath, buffer);
  try {
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();
    console.log(docs);
    return NextResponse.json({ message: "Success", docs }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load PDF" }, { status: 400 });
  } finally {
    await fs.unlink(tempFilePath);
  }
}
