import { IDBPDatabase, openDB } from "idb";

const DB_NAME = "ZeroDocKeys";
const STORE_NAME = "privateKeys";

const getDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const savePrivateKeys = async (userId: string, key: CryptoKey) => {
  const db = await getDB();
  await db.put(STORE_NAME, key, userId);
};

export const getPrivateKey = async (userId: string): Promise<CryptoKey> => {
  const db = await getDB();
  return await db.get(STORE_NAME, userId);
};
