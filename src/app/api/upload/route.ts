import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { pdfFileSchema } from "@/lib/zodSchemas";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { embedder, vectorStore, splitter } from "@/store/models";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const parsedFile = pdfFileSchema.safeParse({ file });
  if (!parsedFile.success) {
    return NextResponse.json({ error: "Invalid File" }, { status: 400 });
  }

  const buffer = Buffer.from(await parsedFile.data.file.arrayBuffer());
  const pdfID = randomUUID();
  const tempFilePath = path.join("/tmp", `${pdfID}.pdf`);
  await fs.writeFile(tempFilePath, buffer);
  try {
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();
    const chunks = await splitter.splitDocuments(docs);
    const vectors = await embedder.embedDocuments(
      chunks.map((doc) => doc.pageContent)
    );
    const ids = chunks.map(() => randomUUID());
    const cleanedChunks = chunks.map((doc, index) => {
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          pageNumber: doc.metadata?.loc?.pageNumber,
          source: pdfID,
          id: ids[index],
        },
      });
    });
    await vectorStore.addVectors(vectors, cleanedChunks, { ids });

    return NextResponse.json({ message: "Success", pdfID }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to load PDF" }, { status: 400 });
  } finally {
    await fs.unlink(tempFilePath);
  }
}
