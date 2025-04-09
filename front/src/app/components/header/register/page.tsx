"use client";
import React, { useState } from "react";
import axi from "@/utils/api";
import { useUser } from "@/hooks/user-context";
import HollowButton from "@components/buttons/hollow_button/page";
import { useNotificationManager } from "@/hooks/notification-context";
import Image from "next/image";
import CloseButton from "@/app/components/buttons/close_button/page";

const formatPhoneNumber = (value: string) => {
  const phoneNumber = value.replace(/\D/g, "");

  if (phoneNumber.length === 0) {
    return value;
  }

  if (phoneNumber.length <= 1) {
    return `+${phoneNumber}`;
  } else if (phoneNumber.length <= 4) {
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1)}`;
  } else if (phoneNumber.length <= 7) {
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(
      1,
      4
    )}) ${phoneNumber.slice(4)}`;
  } else if (phoneNumber.length <= 9) {
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(
      1,
      4
    )}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
  } else {
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(
      1,
      4
    )}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(
      7,
      9
    )}-${phoneNumber.slice(9, 11)}`;
  }
};

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
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchUser } = useUser();
  const { addNotification } = useNotificationManager();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error("Пароли не совпадают");
      }

      const response = await axi.post(`auth/register`, {
        login,
        email,
        phone,
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
      <div className="bg-opacity-90 bg-white backdrop-blur-sm border-2 border-white rounded-lg shadow-lg p-6 w-[650px] h-[450px] relative">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold text-black">Регистрация</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-8 h-[calc(100%-50px)]"
        >
          <div className="flex flex-col justify-between h-full w-1/2">
            <div>
              <p className="text-[#aaa] ml-[8px] mb-2">
                Введите данные для регистрации
              </p>

              <div className="mb-2">
                <input
                  type="text"
                  className="w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
                  placeholder="Логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="mb-2">
                <input
                  type="email"
                  className="w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="mb-2">
                <input
                  type="tel"
                  className="w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
                  placeholder="Телефон"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  disabled={isLoading}
                  autoComplete="tel"
                  pattern="\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}"
                />
              </div>

              <div className="mb-2">
                <input
                  type="password"
                  className="w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
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
                  className="w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <HollowButton
                type="submit"
                label={isLoading ? "Регистрация..." : "Зарегистрироваться"}
              />
              <button
                type="button"
                onClick={onLoginOpen}
                className="text-black hover:underline cursor-pointer text-sm"
                disabled={isLoading}
              >
                Уже есть аккаунт? Войти
              </button>
            </div>
          </div>

          <div className="relative">
            <Image
              width={360}
              height={360}
              src="/images/reg.svg"
              alt="Регистрация"
            />
            <CloseButton onClick={onClose} />
          </div>
        </form>
      </div>
    </div>
  );
}
