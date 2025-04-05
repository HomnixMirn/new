"use client"
import React, { useState } from "react";
import { API_URL } from "@/index";

export default function Register() {
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [email, setEmail] = useState("");
    const [login, setLogin] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [everything, setEverything] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (password !== password2) {
            setError("Пароли не совпадают");
            return;
        }
        if (!email || !login || !password || !password2){
            setError("Поля должны быть заполнены");
            return;
        }
        else{
            setEverything("Всё хорошо")
        }

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                login,
                email,
                password,
            }),
        });
        
        const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Ошибка регистрации");
            }
    };

    return (
        <div className="bg-white h-[888px] flex items-center justify-center flex-col ">
            <h1 className="text-2xl  text-black">Регистрация</h1>
             {error && (
                <div className="text-black">
                    {error}
                </div>
             )}

             {everything && (
                <div className="text-black">
                    {everything}
                </div>
             )}
            <input
                type="text"
                className="border rounded p-2 w-[300px] text-black"
                placeholder="Введите логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />
            <input
                type="email"
                className="border rounded p-2 w-[300px] text-black"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative w-[300px]">
                <input
                    type={showPassword ? "text" : "password"}
                    className="border rounded p-2 w-[300px] text-black pr-10"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className=" absolute right-3 top-1/2 transform -translate-y-1/2 text-black"
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>

            <input
                type="password"
                className="border rounded p-2 w-[300px]"
                placeholder="Повторите пароль"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
            />

            <button
                type="submit"
                onClick={handleSubmit}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-[300px]"
            >
                Зарегистрироваться
            </button>
        </div>
    );
}