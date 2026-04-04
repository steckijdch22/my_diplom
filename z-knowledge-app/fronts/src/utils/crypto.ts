export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

export const generateUserKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );
};

export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
};

export const importPublicKey = async (base64: string): Promise<CryptoKey> => {
  const buffer = base64ToArrayBuffer(base64);
  return await window.crypto.subtle.importKey(
    "spki",
    buffer as BufferSource,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt", "wrapKey"],
  );
};

export const generateDocKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

export const wrapKey = async (
  aesKey: CryptoKey,
  rsaPublicKey: CryptoKey,
): Promise<string> => {
  const wrapped = await window.crypto.subtle.wrapKey(
    "raw",
    aesKey,
    rsaPublicKey,
    { name: "RSA-OAEP" },
  );
  return arrayBufferToBase64(wrapped);
};

export const unwrapKey = async (
  base64WrappedKey: string,
  rsaPrivateKey: CryptoKey,
): Promise<CryptoKey> => {
  const wrappedBuffer = base64ToArrayBuffer(base64WrappedKey);
  return await window.crypto.subtle.unwrapKey(
    "raw",
    wrappedBuffer as BufferSource,
    rsaPrivateKey,
    { name: "RSA-OAEP" },
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

export const encryptData = async (
  data: Uint8Array,
  aesKey: CryptoKey,
): Promise<Uint8Array> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    data as BufferSource,
  );
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), 12);
  return result;
};

export const decryptData = async (
  combinedData: Uint8Array,
  aesKey: CryptoKey,
): Promise<Uint8Array> => {
  const iv = combinedData.slice(0, 12);
  const data = combinedData.slice(12);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    data,
  );
  return new Uint8Array(decrypted);
};
