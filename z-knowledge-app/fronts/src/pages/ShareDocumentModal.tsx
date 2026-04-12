import React, { useEffect, useState } from "react";
import { UserWithAccess } from "../types/document.types";
import { addUserAccess } from "../api/document.api";
import { getUserByEmailAPI } from "../api/user.api";
import { importPublicKey, wrapKey } from "../utils/crypto";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  aesKey: CryptoKey;
  docId: string;
  usersWithAccess: UserWithAccess[] | null;
}

export const ShareDocumentModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  docId,
  usersWithAccess,
  aesKey,
}) => {
  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    if (!email || !aesKey) {
      return;
    }
    try {
      const user = await getUserByEmailAPI(email);
      if (!user) {
        setEmail("");
        window.alert("user not found");
        return;
      }
      const publicUserKey = await importPublicKey(user.publicKey);
      const encryptedKey = await wrapKey(aesKey, publicUserKey);
      await addUserAccess(docId, email, encryptedKey);
      setEmail("");
      window.alert("добавлен новый пользователь");
    } catch (error: any) {
      window.alert(`что-то пошло не так ${error.message}`);
    }
  };

  if (!isOpen || !usersWithAccess) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.04l.53-.81a15.54 15.54 0 011.834-2.22m1.094-1.093a15.544 15.544 0 013.628-3.733m2.09-2.32A13.95 13.95 0 0012 2c-2.79 0-5.447.818-7.697 2.225m14.503 9.489a14.801 14.801 0 01-1.213 3.503m-2.909-3.864L15.89 15.89M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Поделиться доступом
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Поле ввода почты */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Пригласить по Email
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
              />
              <button
                onClick={handleInvite}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Пригласить
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 italic">
              * Ключ документа будет зашифрован RSA-ключом получателя перед
              отправкой.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              У кого есть доступ
            </h3>
            <div className="space-y-3">
              {usersWithAccess.map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs mr-3">
                      {u.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {u.email}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-purple-50 border-t border-purple-100">
          <div className="flex items-start">
            <div className="mt-0.5 mr-3">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              <strong>Безопасность Zero-Knowledge:</strong> Ваши данные
              защищены. Доступ предоставляется через криптографический протокол
              RSA-OAEP. Сервер никогда не видит ваши ключи.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
