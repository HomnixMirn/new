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
      console.log("Текущий пользователь:", user);
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
              className="flex flex-col content-center items-center text-[#898989] hover:text-blue-500"
              href="/"
            >
              Главная
              {pathname === "/" && (
                <div className="relative w-[200%] h-0.5 bg-blue-500"></div>
              )}
            </Link>
<<<<<<< HEAD
            <div className="flex w-[35%] content-evenly gap-[20px] flex-row items-center justify-between">
                <Link  className="flex flex-col content-center items-center  text-[#898989] hover:text-[#2E4C59]" href="Home">
                Home
                {pathname === "/Home" ?(
                <div  className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                <Link className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline after" href="Hotels_for_saleome">
                Hotels for sale
                {pathname === "/Hotels_for_saleome" ?(
                <div  className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                <Link  className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline" href="News">
                News
                {pathname === "/News" ?(
                <div  className=" relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                <Link  className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline" href="Contacts">
                Contacts
                {pathname === "/Contacts" ?(
                <div  className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                </div>
                <div className="bg-[#2E4C59] rounded-[5px] w-[160px] content-center justify-around flex h-[35px] ">
                    <Link className="p-1 text-white hover:underline flex content-center justify-around w-[200px] items-center flex-row-reverse "  href="/registr" >
                        <Image 
                            src="/image/login.png"                   
                            alt="Логотип"
                            width={20}
                            height={20}
                        />
                    Авторизация 
                    </Link>
            </div>
=======
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
              href="/map"
            >
              Карта
              {pathname === "/map" && (
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
>>>>>>> 9e65a6a02e98b2d337ceecf2af743d9f8b4cc22e
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
