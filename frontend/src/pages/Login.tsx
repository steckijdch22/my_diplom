import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Пожалуйста, введите почту и пароль");
      return;
    }

    const loginAction = async () => {
      const response = await login(email, password);
      setAuthenticatedUser(response.user);

      return "С возвращением!";
    };

    toast.promise(loginAction(), {
      loading: "Проверка данных...",
      success: (msg) => {
        navigate("/dashboard");
        return msg;
      },
      error: (err) =>
        err.response?.data?.message || "Неверный логин или пароль",
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Вход в систему
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95"
          >
            Войти
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
