import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuid4 } from "uuid";
import { promises as fs } from "fs";
import { pdfFileSchema } from "@/lib/zodSchemas";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { embedder, splitter, client } from "@/store/models";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { countTotalTokens } from "@/utils/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limits = await prisma.userLimits.findUnique({
    where: {
      userEmail: session.user.email,
    },
    select: {
      dailyCount: true,
      monthlyCount: true,
    },
  });
  if (!limits) {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }
  if (limits.monthlyCount >= parseInt(process.env.MONTHLY_LIMIT || "5")) {
    return NextResponse.json(
      { error: "Monthly rate limit exceeded." },
      { status: 429 }
    );
  }
  if (limits.dailyCount >= parseInt(process.env.DAILY_LIMIT || "1")) {
    return NextResponse.json(
      { error: "Daily rate limit exceeded." },
      { status: 429 }
    );
  }
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const parsedFile = pdfFileSchema.safeParse({ file });
  if (!parsedFile.success) {
    return NextResponse.json({ error: "Invalid File" }, { status: 400 });
  }

  const buffer = Buffer.from(await parsedFile.data.file.arrayBuffer());
  const pdfID = uuid4();
  const tempFilePath = path.join("/tmp", `${pdfID}.pdf`);
  await fs.writeFile(tempFilePath, buffer);
  try {
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();
    const totalTokenCount = countTotalTokens(docs);
    const threshold = process.env.EMBEDDING_THRESHOLD || "40000";
    if (totalTokenCount > parseInt(threshold))
      return NextResponse.json(
        { error: "Token count exceeded. Please try with a smaller pdf." },
        { status: 400 }
      );
    const chunks = await splitter.splitDocuments(docs);
    const vectors = await embedder.embedDocuments(
      chunks.map((doc) => doc.pageContent)
    );
    const ids = chunks.map(() => uuid4());
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
    const vectorStore = await client.getOrCreateCollection({
      name: "pdfCollection",
    });
    await vectorStore.add({
      ids: ids,
      embeddings: vectors,
      documents: cleanedChunks.map((doc) => doc.pageContent),
      metadatas: cleanedChunks.map((doc) => doc.metadata),
    });
    await prisma.userLimits.update({
      where: {
        userEmail: session.user?.email,
      },
      data: {
        dailyCount: { increment: 1 },
        monthlyCount: { increment: 1 },
        totalCount: { increment: 1 },
      },
    });

    return NextResponse.json({ message: "Success", pdfID }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to load PDF" }, { status: 400 });
  } finally {
    await fs.unlink(tempFilePath);
  }
}
