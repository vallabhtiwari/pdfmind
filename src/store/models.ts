import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenAI } from "@google/genai";
import { CloudClient } from "chromadb";

export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});
export const embedder = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL,
});

export const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  database: process.env.CHROMA_DATABASE,
  tenant: process.env.CHROMA_TENANT,
});

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
