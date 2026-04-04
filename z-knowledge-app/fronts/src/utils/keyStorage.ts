import { openDB } from "idb";

const DB_NAME = "ZeroDocKeys";
const STORE_NAME = "privateKeys";

export const savePrivateKeys = async (userId: string, key: CryptoKey) => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  await db.put(STORE_NAME, key, userId);
};

export const getPrivateKey = async (userId: string): Promise<CryptoKey> => {
  const db = openDB(DB_NAME, 1);
  return (await db).get(STORE_NAME, userId);
};
