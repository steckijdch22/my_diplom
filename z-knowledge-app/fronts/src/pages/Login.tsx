import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log(email, password);
      if (!email || !password) {
        return;
      }
      await login(email, password);
      checkAuth();
      navigate("/dashboard");
    } catch (error: any) {
      console.log("error with login", error.message);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход</h2>
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
          onClick={() => handleLogin()}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Войти
        </button>
        <p className="mt-4 text-sm text-center">
          Нет аккаунта?{" "}
          <a href="/register" className="text-blue-600">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
