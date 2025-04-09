"use client";
import React, { useState } from "react";
import axi from "@/utils/api";
import { useUser } from "@/hooks/user-context";
import HollowButton from "@components/buttons/hollow_button/page";
import { useNotificationManager } from "@/hooks/notification-context";
import Image from "next/image";

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
  const [phone, setPhone] = useState("");

  const { fetchUser } = useUser();
  const { addNotification } = useNotificationManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axi.post(`auth/login`, {
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
      <div className="bg-opacity-90 backdrop-blur-sm border-2 border-white rounded-lg shadow-lg p-6 w-[650px] h-[450px] relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
          aria-label="Закрыть"
        >
          &times;
        </button>

        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold">Вход</h1>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex items-center gap-8 h-[calc(100%-50px)]">
          <div className="flex justify-center items-center h-full relative">
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-[220px] p-2 border-2 border-white rounded-[15px] bg-transparent placeholder:text-white"
                  placeholder="Введите номер телефона"
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
                  className="w-[220px] p-2 border-2 border-white rounded-[15px] bg-transparent placeholder:text-white"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2">
              <HollowButton
                type="submit"
                label={isLoading ? "Вход..." : "Войти"}
              />
              <button
                type="button"
                onClick={onRegisterOpen}
                className="text-white hover:underline cursor-pointer text-sm"
                disabled={isLoading}
              >
                Регистрация
              </button>
            </div>
          </div>
          <div>
            <Image 
              width={360}
              height={360}
              src="/images/icons/auth.png"
              alt="Authentication"
            />  
          </div>
        </form>
      </div>
    </div>
  );
}