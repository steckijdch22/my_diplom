import React from "react";

const Login = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full p-2 mb-6 border rounded"
        />
        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
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
