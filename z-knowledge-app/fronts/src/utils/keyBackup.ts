import { getPrivateKey, savePrivateKeys } from "./keyStorage";
import { exportPrivateKey, importPrivateKeyStr } from "./crypto";

export const exportKeyToFile = async (userId: string, email: string) => {
  const privKey = await getPrivateKey(userId);
  if (!privKey) {
    throw new Error("Приватный ключ не найден в этом браузере");
  }

  const keyStr = await exportPrivateKey(privKey);
  const blob = new Blob([keyStr], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `zerodoc_${email}.key`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return "Файл ключа успешно создан";
};

export const importKeyFromFile = (
  file: File,
  userId: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const keyStr = e.target?.result as string;
        if (!keyStr) throw new Error("Файл пуст");

        const importedKey = await importPrivateKeyStr(keyStr);
        await savePrivateKeys(userId, importedKey);

        resolve("Ключ успешно импортирован");
      } catch (err) {
        reject(new Error("Неверный формат файла ключа"));
      }
    };

    reader.onerror = () => reject(new Error("Ошибка при чтении файла"));
    reader.readAsText(file);
  });
};
