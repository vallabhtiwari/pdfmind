import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { pdfFileSchema } from "@/lib/zodSchemas";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";

export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});
export const embedder = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const chunks = await splitter.splitDocuments(docs);
    const vectors = await embedder.embedDocuments(
      chunks.map((doc) => doc.pageContent)
    );
    const ids = chunks.map(() => randomUUID());
    const vectorStore = await Chroma.fromExistingCollection(embedder, {
      collectionName: "pdf-collection",
      url: "http://localhost:8000",
    });

    const cleanedChunks = chunks.map((doc, index) => {
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          pageNumber: doc.metadata?.loc?.pageNumber,
          source: doc.metadata?.source,
          id: ids[index],
        },
      });
    });
    await vectorStore.addVectors(vectors, cleanedChunks, { ids });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to load PDF" }, { status: 400 });
  } finally {
    await fs.unlink(tempFilePath);
  }
}
