import { ai, vectorStore } from "@/store/models";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { query, pdfID } = await req.json();
    if (!query || !pdfID) {
      return NextResponse.json({ error: "Invalid query!" }, { status: 400 });
    }
    const searchedResults = await vectorStore.similaritySearch(query, 4, {
      source: pdfID,
    });
    const rawText = searchedResults.map((doc) => doc.pageContent).join("\n\n");

    const prompt = `
You are an expert assistant. A user asked: "${query}".
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
    return NextResponse.json(
      { error: "Search failed. Please try again" },
      { status: 400 }
    );
  }
}
