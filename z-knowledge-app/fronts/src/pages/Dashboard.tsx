import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DocumentBlock from "../components/DocumentBlock";

interface DocumentItem {
  id: string;
  title: string;
  role: "owner" | "shared";
  updatedAt: string;
  labels: string[];
}

const MOCK_DOCS: DocumentItem[] = [
  {
    id: "1",
    title: "Курсовая работа. ZK-CRDT",
    role: "owner",
    updatedAt: "2023-10-25",
    labels: ["Учеба", "Важное"],
  },
  {
    id: "2",
    title: "План проекта",
    role: "owner",
    updatedAt: "2023-10-24",
    labels: ["Работа"],
  },
  {
    id: "3",
    title: "Секретные записи (Доступ от Антона)",
    role: "shared",
    updatedAt: "2023-10-20",
    labels: ["Shared"],
  },
];

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCS);
  const navigate = useNavigate();

  const handleCreateNew = () => {
    const title = prompt("Введите название нового документа:");
    if (!title) return;

    const newId = Math.random().toString(36).substring(2, 9);

    const newDoc: DocumentItem = {
      id: newId,
      title: title,
      role: "owner",
      updatedAt: new Date().toISOString().split("T")[0],
      labels: ["Новый"],
    };
    setDocuments([newDoc, ...documents]);
  };

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
            onClick={handleCreateNew}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center"
          >
            <span className="mr-2">+</span> Создать документ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentBlock document={doc} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
