import { AxiosResponse } from "axios";
import { DocumentType, UserWithAccess } from "../types/document.types";
import { api } from "./api";
import { data } from "react-router-dom";

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

export const getAccessUsers = async (docId: string) => {
  const res: AxiosResponse<UserWithAccess[]> = await api.get(
    `/document/user/access/${docId}`,
  );
  return res.data;
};

export const addUserAccess = async (
  docId: string,
  targetEmail: string,
  encryptedKey: string,
) => {
  const res = await api.post(`/document/share/${docId}`, {
    targetEmail,
    encryptedKey,
  });
  return res.data;
};
