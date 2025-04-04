"use client";
import React, { useState } from "react";
import { API_URL } from "@/index";
import axi from "@/utils/api";
import { useUser } from "@/hooks/user-context";
import SolidButton from "@components/buttons/solid_button/page";
import HollowButton from "@components/buttons/hollow_button/page";

interface LoginFormProps {
  onClose: () => void;
  onLoginSuccess: () => void;
  onRegisterOpen: () => void;
}

export default function LoginForm({
  onClose,
  onLoginSuccess,
  onRegisterOpen,
}: LoginFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = {
      login: login,
      password: password,
    };

    try {
      const response = await axi.post(`${API_URL}auth/login`, formData);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        // await fetchUser(); //пока что не реализованно
        // onLoginSuccess(); тут какая то ошибка падает
        onClose();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Неверный логин или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-opacity-90 backdrop-blur-sm border-2 border-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Авторизация</h1>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border-2 border-white rounded bg-transparent placeholder:text-white"
              placeholder="Введите логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              className="w-full p-2 border-2 border-white rounded bg-transparent placeholder:text-white"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 w-full justify-center">
              <HollowButton
                type="submit"
                label={isLoading ? "Вход..." : "Войти"}
              />
              <HollowButton onClick={onClose} label="Закрыть" />
            </div>

            <div className="flex flex-col items-center">
              <p>Нет аккаунта?</p>
              <button
                type="button"
                onClick={onRegisterOpen}
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 hover:text-white hover:underline transition duration-300"
                disabled={isLoading}
              >
                Зарегистрируйтесь
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
