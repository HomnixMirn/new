"use client";
import Link from "next/link";
import SolidButton from "@/app/components/buttons/solid_button/page";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/user-context";
import LoginForm from "@components/header/login/page";
import RegisterForm from "@/app/components/header/register/page";

export default function Header() {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { user, fetchUser } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("Текущий пользователь:", user);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    fetchUser?.();
  };

  return (
    <>
      <header className="bg-white w-full h-[68px] content-center">
        <div className="flex flex-row justify-around items-center">
          <Link className="text-[45px] w-[30%]" href="/">
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              SKILLSWAP
            </span>
          </Link>
          <div className="flex w-[35%] content-evenly gap-[20px] flex-row items-center justify-between">
            <Link
              className="flex flex-col content-center items-center text-[#898989] hover:text-blue-500"
              href="/"
            >
              Главная
              {pathname === "/" && (
                <div className="relative w-[200%] h-0.5 bg-blue-500"></div>
              )}
            </Link>
            <Link
              className="flex flex-col items-center text-[#898989] hover:text-blue-500 "
              href="/catalog"
            >
              Каталог
              {pathname === "/catalog" && (
                <div className="relative w-[200%] h-0.5 bg-blue-500"></div>
              )}
            </Link>
            <Link
              className="flex flex-col items-center text-[#898989] hover:text-blue-500 "
              href="/coverage_map"
            >
              Карта
              {pathname === "/coverage_map" && (
                <div className="relative w-[200%] h-0.5 bg-blue-500"></div>
              )}
            </Link>
            {isLoggedIn && (
              <Link
                className="flex flex-col items-center text-[#898989] hover:text-blue-500"
                href="/profile"
              >
                Профиль
                {pathname === "/profile" && (
                  <div className="relative w-[200%] h-0.5 bg-blue-500"></div>
                )}
              </Link>
            )}
          </div>
          <div className="ontent-center justify-around flex ">
            {isLoggedIn ? (
              <SolidButton
                onClick={handleLogout}
                color="gradient"
                label="Выйти"
              />
            ) : (
              <SolidButton
                onClick={() => setIsLoginOpen(true)}
                color="gradient"
                label="Авторизоватся"
              />
            )}
          </div>
        </div>
      </header>

      {isLoginOpen && (
        <LoginForm
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onRegisterOpen={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
        />
      )}

      {isRegisterOpen && (
        <RegisterForm
          onClose={() => setIsRegisterOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
          onLoginOpen={() => {
            setIsRegisterOpen(false);
            setIsLoginOpen(true);
          }}
        />
      )}
    </>
  );
}
