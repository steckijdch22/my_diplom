import React from "react";

interface Props {
  isOpen: boolean;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const KeyWarningModal: React.FC<Props> = ({ isOpen, onImport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-amber-600"
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

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ключ не найден!
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Вы вошли в аккаунт с нового устройства. Чтобы расшифровать ваши
          документы, необходимо загрузить
          <span className="font-bold text-gray-800">
            {" "}
            файл приватного ключа (.key)
          </span>
          , который вы скачали при регистрации.
        </p>

        <div className="space-y-4">
          <label className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-purple-200">
            Импортировать ключ
            <input
              type="file"
              className="hidden"
              accept=".key"
              onChange={onImport}
            />
          </label>

          <p className="text-xs text-gray-400">
            Без ключа вы сможете видеть список документов, но не сможете их
            открыть.
          </p>
        </div>
      </div>
    </div>
  );
};
