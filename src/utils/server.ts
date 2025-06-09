import { Document } from "@langchain/core/documents";
import { getEncoding, TiktokenEncoding } from "js-tiktoken";

const tokenizer = getEncoding(process.env.ENCODING_NAME as TiktokenEncoding);

export function countTotalTokens(docs: Document[]) {
  return docs.reduce(
    (sum, doc) => sum + tokenizer.encode(doc.pageContent).length,
    0
  );
}
