export type DocumentType = {
  id: string;
  title: string;
  encryptedContent: BinaryType | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
};
