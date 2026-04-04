export type DocumentType = {
  id: string;
  title: string;
  encryptedContent: BinaryType | null;
  documentKey: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
};
