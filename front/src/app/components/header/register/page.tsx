"use client";
import React, { useState } from "react";
import { API_URL } from "@/index";
import axi from "@/utils/api";
import { useUser } from "@/hooks/user-context";
import HollowButton from "@components/buttons/hollow_button/page";
import { useNotificationManager } from "@/hooks/notification-context";

interface RegisterFormProps {
  onClose: () => void;
  onRegisterSuccess: () => void;
  onLoginOpen: () => void;
}

export default function RegisterForm({
  onClose,
  onRegisterSuccess,
  onLoginOpen,
}: RegisterFormProps) {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchUser } = useUser();
  const { addNotification } = useNotificationManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error("Пароли не совпадают");
      }

      const response = await axi.post(`${API_URL}auth/register`, {
        login,
        email,
        password,
        password2: confirmPassword,
      });

      if (response.status === 201) {
        localStorage.setItem("token", response.data.token);
        await fetchUser?.();
        onRegisterSuccess();
        addNotification({
          id: Date.now().toString(),
          title: "Успешная регистрация",
          description: "Добро пожаловать!",
          status: 200,
          createdAt: new Date().toISOString(),
        });
        onClose();
      }
    } catch (error) {
      const err = error as any;
      let errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Произошла ошибка при регистрации";

      if (err.response?.data?.errors?.email) {
        errorMessage = "Пользователь с таким email уже существует";
      } else if (err.response?.data?.errors?.login) {
        errorMessage = "Пользователь с таким логином уже существует";
      }

      setError(errorMessage);
      addNotification({
        id: Date.now().toString(),
        title: "Ошибка регистрации",
        description: errorMessage,
        status: 400,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-opacity-90 backdrop-blur-sm border-2 border-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Регистрация</h1>

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
              type="email"
              className="w-full p-2 border-2 border-white rounded bg-transparent placeholder:text-white"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
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
              autoComplete="new-password"
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              className="w-full p-2 border-2 border-white rounded bg-transparent placeholder:text-white"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 w-full justify-center">
              <HollowButton
                type="submit"
                label={isLoading ? "Регистрация..." : "Зарегистрироваться"}
                disabled={isLoading}
              />
              <HollowButton
                onClick={onClose}
                label="Закрыть"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col items-center">
              <p>Уже есть аккаунт?</p>
              <button
                type="button"
                onClick={onLoginOpen}
                className="text-white hover:underline cursor-pointer"
                disabled={isLoading}
              >
                Авторизируйтесь
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
