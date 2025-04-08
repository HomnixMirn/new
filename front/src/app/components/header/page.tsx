"use client";
import Link from "next/link";
import SolidButton from "@/app/components/buttons/solid_button/page";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/user-context";
import LoginForm from "@components/header/login/page";
import RegisterForm from "@/app/components/header/register/page";
import axi from "@/utils/api";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { user, cleanupUser, fetchUser } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const telegramBotLink =
    "https://t.me/shadow7xbot?start=u_129&utm_campaign=115371697&utm_content=16641918526|clid|15984713945027182591&utm_term=бесплатный%20телеграм%20бот&yclid=15984713945027182591";
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    fetchUser().catch((error) => {
      console.error("Ошибка загрузки пользователя:", error);
    });
  }, []);

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
    fetchUser();
  };

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axi.get("/logout", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      cleanupUser();
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      window.location.href = "/";
    }
  };

  return (
    <>
      <header className="bg-black w-full h-[68px] content-center">
        <div className="flex flex-row justify-around items-center">
          <Link className="text-[45px] w-[30%]" href="/">
            <Image
              src={"/images/t2_avatar/avatar/T2_Avatar_Primary.png"}
              alt={"Logo"}
              width={50}
              height={50}
            />
          </Link>

          <div className="flex w-[35%] content-evenly gap-[20px] flex-row items-center justify-between">
            <Link
              className="flex flex-col items-center text-[#898989] hover:text-white "
              href="/"
            >
              Главная
              {pathname === "/" && (
                <div className="relative w-[200%] h-0.5 bg-white"></div>
              )}
            </Link>

            <Link
              className="flex flex-col items-center text-[#898989] hover:text-white"
              href="/catalog"
            >
              Каталог
              {pathname === "/catalog" && (
                <div className="relative w-[200%] h-0.5 bg-white"></div>
              )}
            </Link>
            <a
              href="https://t.me/shadow7xbot?start=u_129&utm_campaign=115371697&utm_content=16641918526|clid|15984713945027182591&utm_term=бесплатный%20телеграм%20бот&yclid=15984713945027182"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-[#898989] hover:text-white"
            >
              Наш бот
            </a>
            <Link
              className="flex flex-col items-center text-[#898989] hover:text-white"
              href="/coverage_map"
            >
              Карта
              {pathname === "/coverage_map" && (
                <div className="relative w-[200%] h-0.5 bg-white"></div>
              )}
            </Link>

            {isLoggedIn && (
              <Link
                className="flex flex-col items-center text-[#898989] hover:text-white hover:bg-blue"
                href="/profile"
              >
                Профиль
                {pathname === "/profile" && (
                  <div className="relative w-[200%] h-0.5 bg-white"></div>
                )}
              </Link>
            )}
          </div>

          <div className="content-center justify-around flex">
            {isLoggedIn ? (
              <SolidButton
                onClick={handleLogout}
                color="gradient"
                label="Выйти"
              />
            ) : (
              <SolidButton
                onClick={() => setIsLoginOpen(true)}
                color="gradien"
                label="Авторизоваться"
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
