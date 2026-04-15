import React, { useState } from "react";
import { registration } from "../api/auth";
import { exportPublicKey, generateUserKeyPair } from "../utils/crypto";
import { savePrivateKeys } from "../utils/keyStorage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      if (!email || !password) {
        toast.warning("Пожалуйста, заполните все поля");
        return;
      }
      const keys = await generateUserKeyPair();
      const pubStr = await exportPublicKey(keys.publicKey);
      const res = await registration(email, password, pubStr);

      await savePrivateKeys(res.user.id, keys.privateKey);
      setEmail("");
      setPassword("");
      toast.success("Аккаунт создан успешно!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ошибка при входе");
    }
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Пароль"
          className="w-full p-2 mb-6 border rounded"
        />
        <button
          onClick={() => handleRegister()}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Зарегистрироваться
        </button>
        <p className="mt-4 text-sm text-center">
          Уже есть аккаунт?{" "}
          <a href="/login" className="text-blue-600">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
