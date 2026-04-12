import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TextEditor } from "../components/TextEditor";
import { getAccessUsers, getDocumentById } from "../api/document.api";
import { DocumentType, UserWithAccess } from "../types/document.types";
import { ShareDocumentModal } from "./ShareDocumentModal";
import { useAuth } from "../context/AuthContext";
import { getPrivateKey } from "../utils/keyStorage";
import { unwrapKey } from "../utils/crypto";

export const EditorRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [usersWithAccess, setUsersWithAccess] = useState<
    UserWithAccess[] | null
  >(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setIsDecrypting(true);
      try {
        if (!id || !user) {
          return;
        }
        const document = await getDocumentById(id);
        setDocument(document);

        const privKey = await getPrivateKey(user.userId);
        if (privKey) {
          const decryptedKey = await unwrapKey(document.wrappedKey, privKey);
          setAesKey(decryptedKey);
        }
      } catch (error: any) {
        console.log(error.message);
      } finally {
        setIsDecrypting(false);
      }
    };

    const fetchAccessUsers = async () => {
      try {
        if (!id) {
          return;
        }
        const accessUsers = await getAccessUsers(id);
        setUsersWithAccess(accessUsers);
      } catch (error: any) {
        console.log(error.message);
      }
    };
    fetchDocument();
    fetchAccessUsers();
  }, [id, user]);

  const handleShare = () => {
    alert("Модальное окно Share...");
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col font-sans overflow-hidden">
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm relative z-50">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-gray-500 hover:text-gray-800 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <input
              type="text"
              defaultValue="Название документа"
              className="text-lg font-bold text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none hover:bg-gray-50 px-2 py-1 rounded cursor-text"
              value={document?.title}
            />
            <div className="flex items-center px-2 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
              <span className="text-xs text-green-600 font-medium tracking-wide">
                E2E ЗАШИФРОВАНО • ID: {id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-md font-medium text-sm flex items-center transition-colors"
          >
            Поделиться
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative bg-gray-100 flex flex-col">
        {isDecrypting || !aesKey ? (
          <div className="flex justify-center mt-20 text-gray-500">
            Расшифровка ключей документа...
          </div>
        ) : (
          <>{id && <TextEditor documentId={id} aesKey={aesKey} />}</>
        )}
      </main>
      {aesKey && id && (
        <ShareDocumentModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          usersWithAccess={usersWithAccess}
          aesKey={aesKey}
          docId={id}
        />
      )}
    </div>
  );
};
