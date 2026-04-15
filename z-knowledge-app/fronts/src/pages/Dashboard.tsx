import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DocumentBlock from "../components/DocumentBlock";
import { CreateDocumentModal } from "../components/CreateDocumentModal";
import {
  createDocumentApi,
  deleteDocument,
  getDocumentsApi,
} from "../api/document.api";
import { useAuth } from "../context/AuthContext";
import {
  exportPrivateKey,
  generateDocKey,
  importPrivateKeyStr,
  importPublicKey,
  wrapKey,
} from "../utils/crypto";
import { getPrivateKey, savePrivateKeys } from "../utils/keyStorage";
import { KeyWarningModal } from "../components/KeyWarningModal";
import { logoutApi } from "../api/auth";
import { toast } from "sonner";

export interface DocumentItem {
  id: string;
  title: string;
  role: "owner" | "guest";
  updatedAt: string;
  labels: string[];
}

const Dashboard: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [openNewModal, setNewOpenModal] = useState<boolean>(false);
  const [isKeyMissing, setIsKeyMissing] = useState<boolean>(false);

  const handleCreateNew = async (title: string) => {
    if (!user || !user.publicKey) {
      console.error(
        "❌ Ошибка: данные пользователя или публичный ключ отсутствуют!",
        user,
      );
      return;
    }
    const createAction = async () => {
      const aesKey = await generateDocKey();
      const myRsaPubKey = await importPublicKey(user.publicKey);
      const wrappedKey = await wrapKey(aesKey, myRsaPubKey);
      const document = await createDocumentApi(title, wrappedKey);
      const newDoc: DocumentItem = {
        id: document.id,
        title: document.title,
        role: document.role,
        updatedAt: new Date(document.updatedAt).toISOString().split("T")[0],
        labels: ["Новый"],
      };

      setDocuments((prev) => [newDoc, ...prev]);
      return `Документ "${title}" создан и защищен`;
    };

    toast.promise(createAction(), {
      loading: "Генерация ключей шифрования...",
      success: (msg) => msg,
      error: "Не удалось создать защищенный документ",
    });
  };

  const handleExportKey = async () => {
    try {
      if (!user) {
        return;
      }
      const privKey = await getPrivateKey(user.userId);
      if (!privKey) {
        toast.error("Ключ не найден", {
          description: "Приватный ключ отсутствует в этом браузере",
        });
        return;
      }
      const keyStr = await exportPrivateKey(privKey);
      const blob = new Blob([keyStr], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `zerodoc_${user.email}.key`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Бэкап ключа создан", {
        description: "Сохраните этот файл в надежном месте!",
      });
    } catch (error) {
      toast.error("Ошибка при экспорте ключа");
    }
  };

  const handleImportKey = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }
    const importAction = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const keyStr = e.target?.result as string;
          const importedKey = await importPrivateKeyStr(keyStr);
          await savePrivateKeys(user.userId, importedKey);
          resolve("Ключ успешно импортирован");
          setIsKeyMissing(false);
          window.location.reload();
        } catch (err) {
          reject("Неверный формат файла ключа");
        }
      };
      reader.onerror = () => reject("Ошибка чтения файла");
      reader.readAsText(file);
    });
    toast.promise(importAction, {
      loading: "Проверка и импорт ключа...",
      success: (msg: any) => msg,
      error: (err) => err,
    });
  };

  const handleDelete = async (docId: string) => {
    const deleteAction = async () => {
      const deletedDoc = await deleteDocument(docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== deletedDoc.id));
      return "Документ удален";
    };

    toast.promise(deleteAction(), {
      loading: "Удаление документа...",
      success: (msg) => msg,
      error: "Ошибка при удалении. Проверьте права доступа.",
    });
  };

  const handleLogout = async () => {
    const logoutAction = async () => {
      await logoutApi();
      await checkAuth();
      return "Вы вышли из системы";
    };

    toast.promise(logoutAction(), {
      loading: "Завершение сессии...",
      success: (msg) => msg,
      error: "Ошибка при выходе",
    });
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (user?.userId) {
        try {
          const docsFromApi = await getDocumentsApi(user.userId);

          const mappedDocuments: DocumentItem[] = docsFromApi.map((doc) => ({
            id: doc.id,
            title: doc.title,
            role: doc.role,
            updatedAt: new Date(doc.updatedAt).toISOString().split("T")[0],
            labels: ["Новый"],
          }));

          setDocuments(mappedDocuments);
        } catch (error) {
          console.error("Ошибка загрузки документов:", error);
        }
      }
    };

    fetchDocuments();
  }, [user]);

  useEffect(() => {
    const checkPrivKey = async () => {
      if (!user) {
        return;
      }
      const privKey = await getPrivateKey(user.userId);
      if (!privKey) {
        setIsKeyMissing(true);
      }
    };
    checkPrivKey();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <KeyWarningModal onImport={handleImportKey} isOpen={isKeyMissing} />
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="text-xl font-semibold">ZeroDoc</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={handleExportKey}
              className="text-xs font-medium px-3 py-1.5 hover:bg-white rounded-md transition-all flex items-center"
              title="Скачать бэкап ключа"
            >
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Бэкап ключа
            </button>

            <label className="text-xs font-medium px-3 py-1.5 hover:bg-white rounded-md transition-all cursor-pointer flex items-center">
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Импорт
              <input
                type="file"
                className="hidden"
                onChange={handleImportKey}
                accept=".key,.txt"
              />
            </label>
          </div>

          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Выйти
          </button>
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
            <DocumentBlock
              document={doc}
              key={doc.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
