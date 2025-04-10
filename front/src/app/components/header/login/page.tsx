"use client";
import React, { useState } from "react";
import axi from "@/utils/api";
import { useUser } from "@/hooks/user-context";
import HollowButton from "@components/buttons/hollow_button/page";
import { useNotificationManager } from "@/hooks/notification-context";
import Image from "next/image";

import CloseButton from "@/app/components/buttons/close_button/page";

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

  const [imgSrc, setImgSrc] = useState("/images/Icons/cross.svg");

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
    <div className="bg-black/50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white justify-between rounded-[14px] w-[650px] h-[400px] p-5 box-border flex">
        <div className="justify-center">
          <p className="text-7xl">Вход</p>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-8 h-[calc(100%-50px)]"
          >
            <div className="flex mt-8 justify-center items-center h-full relative">
              <div>
                <p className="text-[#aaa] ml-[8px] text-sm">Введите логин и пароль</p>
                <div className="mb-2">
                  <input
                    type="text"
                    className="mt-[5px] w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
                    placeholder="Логин"
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
                    className="w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex flex-col items-center ">
                <button
                  className="w-full h-10
                  relative mt-15 text-base bg-black text-white px-6 py-2 rounded-[20px] font-medium overflow-hidden group transition-all duration-300 hover:bg-[#FF3495] flex justify-center items-center"
                >
                  <span className="relative z-10 group-hover:text-white duration-300 text-[20px] font-bold tracking-normal leading-none text-center">
                    Войти
                  </span>
                </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="relative top-0 right-0">
          <Image
            width={360}
            height={360}
            src="/images/auth.svg"
            alt="Авторизация"
          />
          <CloseButton onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
