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

export default function Form({
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

  return <div className="z-1000 w-full h-full fixed inset-0 bg-black/50">
    <div className="bg-white rounded-[16px] w-[432px] h-[500px]">
        <p className="">Оставить оценку
        качества сети</p>
        <input 
        type="text"
        placeholder="Ваш комментарий"
        className="bg-[#F2F2F2] w-[340px] h-[140px]"
        />
        <p>Поставьте оценку</p>

    </div>
  </div>
}
