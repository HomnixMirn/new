"use client";
import React, { useState } from "react";
import { API_URL } from "@/index";
import axi from "@/utils/api";
import { useUser } from "@/hooks/user-context";
import HollowButton from "@components/buttons/hollow_button/page";
import { useNotificationManager } from "@/hooks/notification-context";

interface LoginFormProps {
  onClose: () => void;
  onLoginSuccess: () => void;
  onRegisterOpen: () => void;
  onLogout: () => void;
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
  const { addNotification } = useNotificationManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);


    try {
      const response = await axi.post(`${API_URL}auth/login`, {
        login,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        await fetchUser?.();
        onLoginSuccess();
        addNotification({
          id: Date.now().toString(),
          title: "Успешная авторизация",
          description: "Добро пожаловать!",
          status: 200,
          createdAt: new Date().toISOString(),
        });
        onClose();
      }
    } catch (error) {
      const err = error as any;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Произошла ошибка при авторизации";

      setError(errorMessage);
      addNotification({
        id: Date.now().toString(),
        title: "Ошибка авторизации",
        description: errorMessage,
        status: 401,
        createdAt: new Date().toISOString(),
      });
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
                className="text-white hover:underline cursor-pointer"
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
