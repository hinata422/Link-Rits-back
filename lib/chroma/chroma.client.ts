import { ChromaClient } from "chromadb";

export const chroma = new ChromaClient({
  path: "./chroma", // ローカルDB
});
