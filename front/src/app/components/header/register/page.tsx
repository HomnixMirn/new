"use client";
import React, { useState } from "react";
import axi from "@/utils/api";
import { useUser } from "@/hooks/user-context";
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
    <div className="bg-black/50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white justify-between rounded-[14px] w-[650px] h-[400px] p-5 box-border flex">
        <div className="justify-center">
          <p className="text-3xl text-black">Регистрация</p>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-8 h-[calc(100%-50px)]"
          >
            <div className="flex mt-8 justify-center items-center h-full relative">
              <div>
                
                <div className="mb-2">
                  <input
                    type="text"
                    className="mt-[10px] text-[#aaa] w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
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
                    className="mt-[5px] text-[#aaa] w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
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
                    className="mt-[5px] text-[#aaa] w-full h-[38px] p-2 bg-cover border-black rounded-[10px] bg-[#F3F3F3] placeholder:text-[#B0B0B0]"
                    placeholder="Телефон"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    disabled={isLoading}
                    autoComplete="tel"
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
                
                <div className="mb-2">
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
                
                <div className="flex flex-col items-center">
                  <button
                    className="w-full h-10 relative mt-2 text-base bg-black text-white px-6 py-2 rounded-[20px] font-medium overflow-hidden group transition-all duration-300 hover:bg-[#FF3495] flex justify-center items-center"
                  >
                    <span className="relative z-10 group-hover:text-white duration-300 text-[20px] font-bold tracking-normal leading-none text-center">
                      {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    </span>
                  </button>
                  
                  <div className="text-center mt-1 mb-4">
                    <button
                      type="button"
                      onClick={onLoginOpen}
                      className="text-black hover:underline text-sm"
                    >
                      Уже есть аккаунт? Войти
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="relative top-0 right-0">
          <Image
            width={290}
            height={330}
            src="/images/reg.svg"
            alt="Регистрация"
          />
          <CloseButton onClick={onClose} />
        </div>
      </div>
    </div>
  );
}