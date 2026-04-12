export type DocumentType = {
  id: string;
  title: string;
  role: "owner" | "guest";
  wrappedKey: string;
  updatedAt: Date;
  ownerEmail: string;
};

export type UserWithAccess = {
  id: string;
  email: string;
  role: "owner" | "guest";
};
