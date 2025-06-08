import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuid4 } from "uuid";
import { promises as fs } from "fs";
import { OpenAIWhisperAudio } from "@langchain/community/document_loaders/fs/openai_whisper_audio";
import { ai, vectorStore } from "@/store/models";

export async function POST(req: NextRequest) {
  let tempPath;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const pdfID = formData.get("pdfID") as string;
    if (!file || !pdfID)
      return NextResponse.json({ error: "Invalid query!" }, { status: 400 });

    tempPath = path.join("/tmp", `${uuid4()}.webm`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempPath, buffer);

    const transcriber = new OpenAIWhisperAudio(tempPath);
    const docs = await transcriber.load();
    const transcript = docs[0].pageContent;

    const searchedResults = await vectorStore.similaritySearch(transcript, 4, {
      source: pdfID,
    });
    const rawText = searchedResults.map((doc) => doc.pageContent).join("\n\n");

    const prompt = `
You are an expert assistant. A user asked: "${transcript}".
You were given the following extracted information from a PDF:
"""
${rawText}
"""
Using this, answer the question in a clear, human-friendly way. Don't add anything by yourself, just use the information given from the PDF. If the content doesn't contain the answer, respond: "I couldn't find a relevant answer in the document."
`;

    const geminiResponse = await ai.models.generateContentStream({
      model: process.env.GEMINI_MODEL!,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 1.2,
        topP: 0.9,
        topK: 40,
      },
    });
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of geminiResponse) {
          controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Search failed. Please try again" },
      { status: 400 }
    );
  } finally {
    if (tempPath) await fs.unlink(tempPath);
  }
}
