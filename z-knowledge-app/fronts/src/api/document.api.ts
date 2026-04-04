import { AxiosResponse } from "axios";
import { DocumentType } from "../types/document.types";
import { api } from "./api";

export const createDocumentApi = async (
  title: string,
  documentKey: string,
): Promise<DocumentType> => {
  const response = await api.post("/document", {
    title,
    documentKey,
  });
  return response.data;
};

export const getDocumentsApi = async (
  userId: string,
): Promise<DocumentType[]> => {
  const response = await api.get("/document");
  return response.data;
};

export const getDocumentById = async (docId: string) => {
  const res: AxiosResponse<DocumentType> = await api.get(`/document/${docId}`);
  return res.data;
};
