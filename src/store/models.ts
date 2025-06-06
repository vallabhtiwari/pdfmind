import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenAI } from "@google/genai";

export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});
export const embedder = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});

export const vectorStore = new Chroma(embedder, {
  collectionName: "pdfCollection",
  url: process.env.CHROMADB_URL,
});

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
