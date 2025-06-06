import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";

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
