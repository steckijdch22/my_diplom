import React, { useState } from "react";
import { registration } from "../api/auth";
import { exportPublicKey, generateUserKeyPair } from "../utils/crypto";

import { savePrivateKeys } from "../utils/keyStorage";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { exportKeyToFile } from "../utils/keyBackup";

const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isAgreed, setIsAgreed] = useState<boolean>(false); // Состояние для галочки
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      if (!email || !password) {
        toast.warning("Пожалуйста, заполните все поля");
        return;
      }

      if (!isAgreed) {
        toast.error("Вы должны подтвердить сохранение ключа");
        return;
      }

      const registerAction = async () => {
        const keys = await generateUserKeyPair();
        const pubStr = await exportPublicKey(keys.publicKey);
        const res = await registration(email, password, pubStr);
        await savePrivateKeys(res.user.id, keys.privateKey);

        toast.promise(exportKeyToFile(res.user.id, res.user.email), {
          loading: "Загрузка приватного ключа",
          success: (msg) => msg,
          error: "Не удалось скачать приватный ключ",
        });

        return "Аккаунт создан. Ключ восстановления скачан!";
      };

      toast.promise(registerAction(), {
        loading: "Создание защищенного аккаунта...",
        success: (msg) => {
          navigate("/dashboard");
          return msg;
        },
        error: (err) => err.response?.data?.message || "Ошибка при регистрации",
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Создать аккаунт
        </h2>

        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Пароль"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />

          {/* Блок предупреждения с галочкой */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-start">
              <input
                id="key-check"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="key-check"
                className="ml-3 text-xs text-amber-800 leading-relaxed cursor-pointer"
              >
                Я понимаю, что мои данные зашифрованы. При регистрации будет
                скачан <strong>файл-ключ</strong>. Без него я{" "}
                <strong>навсегда потеряю доступ</strong> к своим документам,
                если очищу кэш браузера.
              </label>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={!isAgreed}
            className="w-full bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95"
          >
            Зарегистрироваться
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-gray-500">
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
