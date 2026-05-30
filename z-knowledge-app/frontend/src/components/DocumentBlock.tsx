import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentItem } from "../pages/Dashboard";

type DocumentProps = {
  document: DocumentItem;
  onDelete: (id: string) => void;
};

const DocumentBlock: React.FC<DocumentProps> = ({ document, onDelete }) => {
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const openDeleteModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(document.id);
    setIsConfirmOpen(false);
  };

  return (
    <>
      <div
        className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full"
        onClick={() => navigate(`/editor/${document.id}`)}
      >
        <div>
          <div className="flex justify-between items-start mb-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                document.role === "owner"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {document.role === "owner" ? "Владелец" : "Совместный доступ"}
            </span>

            <div className="flex items-center space-x-2">
              {document.role === "owner" && (
                <button
                  onClick={openDeleteModal}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить документ"
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

              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {document.title}
          </h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {document.labels.map((label) => (
              <span
                key={label}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-400 mt-4 border-t pt-3 flex justify-between items-center">
          <span>{document.updatedAt}</span>
          <span className="text-[10px] font-mono text-gray-300 uppercase">
            ID: {document.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-red-600"
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
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Удалить документ?
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Это действие нельзя будет отменить. Все зашифрованные данные
              документа будут безвозвратно удалены.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmOpen(false);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
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

export default DocumentBlock;
