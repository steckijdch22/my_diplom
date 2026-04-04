import { DocumentType } from "../types/document.types";
import { api } from "./api";

export const createDocumentApi = async (
  title: string,
): Promise<DocumentType> => {
  const response = await api.post("/document", {
    title,
  });
  return response.data;
};

export const getDocumentsApi = async (
  userId: string,
): Promise<DocumentType[]> => {
  const response = await api.get("/document");
  return response.data;
};
