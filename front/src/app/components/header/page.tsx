"use client";
import Link from "next/link";
import Image from "next/image";
import SolidButton from "@/app/components/buttons/solid_button/page";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LoginForm from "@components/header/login/page";
import { useUser } from "@/hooks/user-context";

export default function Header() {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, fetchUser } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    }
  }, [user]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
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
              className="flex flex-col content-center items-center text-[#898989] hover:text-[#2E4C59]"
              href="/"
            >
              Home
              {pathname === "/" && (
                <div className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]"></div>
              )}
            </Link>
            <Link
              className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline after"
              href="Hotels_for_saleome"
            >
              Hotels for sale
              {pathname === "/Hotels_for_saleome" && (
                <div className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]"></div>
              )}
            </Link>
            <Link
              className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline"
              href="News"
            >
              News
              {pathname === "/News" && (
                <div className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]"></div>
              )}
            </Link>
            {isLoggedIn && (
              <Link
                className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline"
                href="profile"
              >
                Профиль
                {pathname === "/profile" && (
                  <div className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]"></div>
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
          }}
        />
      )}
    </>
  );
}
