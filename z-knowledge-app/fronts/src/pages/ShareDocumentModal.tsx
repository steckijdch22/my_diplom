import React, { useState } from "react";
import { UserWithAccess, DocumentType } from "../types/document.types";
import { addUserAccess, deleteUserAccess } from "../api/document.api";
import { getUserByEmailAPI } from "../api/user.api";
import { importPublicKey, wrapKey } from "../utils/crypto";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  aesKey: CryptoKey;
  document: DocumentType;
  onRefresh: () => void;
  usersWithAccess: UserWithAccess[] | null;
}

export const ShareDocumentModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  document,
  onRefresh,
  usersWithAccess,
  aesKey,
}) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const handleInvite = async () => {
    if (!email || !aesKey) return;
    setIsInviting(true);
    try {
      const user = await getUserByEmailAPI(email);
      if (!user) {
        window.alert("Пользователь с таким email не найден");
        return;
      }
      const publicUserKey = await importPublicKey(user.publicKey);
      const encryptedKey = await wrapKey(aesKey, publicUserKey);

      await addUserAccess(document.id, email, encryptedKey);

      setEmail("");
      onRefresh();
      window.alert(`Доступ для ${email} успешно добавлен`);
    } catch (error: any) {
      window.alert(`Ошибка: ${error.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const executeRemove = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserAccess(document.id, userToDelete.id);
      onRefresh();
      setUserToDelete(null);
    } catch (error: any) {
      window.alert(`Ошибка при удалении: ${error.message}`);
    }
  };

  if (!isOpen || !usersWithAccess) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-all">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Доступ к документу
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
            >
              <svg
                className="w-5 h-5"
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
            {document.role === "owner" && (
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Пригласить участника
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleInvite}
                    disabled={isInviting || !email}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-100"
                  >
                    {isInviting ? "..." : "Добавить"}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
                У кого есть доступ
              </label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {usersWithAccess.map((u) => (
                  <div
                    key={u.id}
                    className="group flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {u.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[180px]">
                          {u.email}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                          {u.role === "owner" ? "Владелец" : "Редактор"}
                        </span>
                      </div>
                    </div>

                    {document.role === "owner" && u.role !== "owner" && (
                      <button
                        onClick={() =>
                          setUserToDelete({ id: u.id, email: u.email })
                        }
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-purple-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Ключи шифруются по стандарту RSA-OAEP 2048
          </div>
        </div>
      </div>

      {userToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto text-red-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Отозвать доступ?
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Пользователь{" "}
              <span className="font-semibold text-gray-800">
                {userToDelete.email}
              </span>{" "}
              больше не сможет открывать этот документ.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={executeRemove}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
