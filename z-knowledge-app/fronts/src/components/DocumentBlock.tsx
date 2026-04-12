import React from "react";
import { useNavigate } from "react-router-dom";
import { DocumentItem } from "../pages/Dashboard";

type DocumetnProps = {
  document: DocumentItem;
};

const DocumentBlock: React.FC<DocumetnProps> = ({ document }) => {
  const navigate = useNavigate();
  return (
    <div
      key={document.id}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full"
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
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
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

      <div className="text-sm text-gray-400 mt-4 border-t pt-3 flex justify-between">
        <span>Обновлен:</span>
        <span>{document.updatedAt}</span>
      </div>
    </div>
  );
};

export default DocumentBlock;
