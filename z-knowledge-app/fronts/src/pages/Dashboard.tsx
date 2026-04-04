import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DocumentBlock from "../components/DocumentBlock";
import { CreateDocumentModal } from "../components/CreateDocumentModal";
import { createDocumentApi, getDocumentsApi } from "../api/document.api";
import { useAuth } from "../context/AuthContext";
import { generateDocKey, importPublicKey, wrapKey } from "../utils/crypto";

interface DocumentItem {
  id: string;
  title: string;
  role: "owner" | "shared";
  updatedAt: string;
  labels: string[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [openNewModal, setNewOpenModal] = useState<boolean>(false);

  const handleCreateNew = async (title: string) => {
    try {
      console.log("🚀 Начало создания документа...");

      if (!user || !user.publicKey) {
        console.error(
          "❌ Ошибка: данные пользователя или публичный ключ отсутствуют!",
          user,
        );
        return;
      }

      const aesKey = await generateDocKey();

      const myRsaPubKey = await importPublicKey(user.publicKey);

      const wrappedKey = await wrapKey(aesKey, myRsaPubKey);

      const document = await createDocumentApi(title, wrappedKey);

      const newDoc: DocumentItem = {
        id: document.id,
        title: document.title,
        role: "owner",
        updatedAt: new Date(document.updatedAt).toISOString().split("T")[0],
        labels: ["Новый"],
      };

      setDocuments([newDoc, ...documents]);
    } catch (error: any) {
      console.error("❌ КРИТИЧЕСКАЯ ОШИБКА ПРИ СОЗДАНИИ:", error);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (user?.userId) {
        try {
          const docsFromApi = await getDocumentsApi(user.userId);

          const mappedDocuments: DocumentItem[] = docsFromApi.map(
            (doc: any) => ({
              id: doc.id,
              title: doc.title,
              role: "owner",
              updatedAt: new Date(doc.updatedAt).toISOString().split("T")[0],
              labels: ["Новый"],
            }),
          );

          setDocuments(mappedDocuments);
        } catch (error) {
          console.error("Ошибка загрузки документов:", error);
        }
      }
    };

    fetchDocuments();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="text-xl font-semibold">ZeroDoc</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">user@example.com</span>
          <Link
            to="/login"
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Выйти
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Мои документы</h1>
          <button
            onClick={() => setNewOpenModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center"
          >
            <span className="mr-2">+</span> Создать документ
          </button>
          <CreateDocumentModal
            isOpen={openNewModal}
            onClose={() => setNewOpenModal(false)}
            onSubmit={handleCreateNew}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentBlock document={doc} key={doc.id} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
