"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname(); //хранит текущий путь
  const [hoveredLink, setHoveredLink] = useState<string | null>(null); //хранит наведенную ссылку

  //список ссылок
  const links = [
    { href: "/", label: "Home" },
    { href: "/hotels_for_sale", label: "Hotels for sale" },
    { href: "/news", label: "News" },
    { href: "/contacts", label: "Contacts" },
  ];

  return (
    <header className="bg-white w-full h-[60px] content-center">
      <div className="flex flex-row justify-around">
        <Link
          className="text-2xl w-[30%] bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text font-bold"
          href="/"
        >
          SKILLSWAP
        </Link>

        <div className="flex w-[40%] content-evenly gap-[20px] flex-row items-center justify-between">
          {/*перечисление всех ссылок*/}
          {links.map((link) => (
            <div key={link.href} className="relative">
              <Link
                className={`text-[#898989] hover:text-[#2E4C59] transition-colors ${
                  pathname === link.href ? "text-blue-500" : ""
                }`}
                href={link.href}
                //подчеркивание под выделенной ссылкой
                onMouseEnter={() => setHoveredLink(link.href)}
                //убираем подчеркивание под ссылкой, если курсор уходит
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.label}
              </Link>
              <div
                className={`absolute bottom-[-5px] left-0 h-[2px] transition-all duration-300 ${
                  pathname === link.href
                    ? "w-full bg-blue-500"
                    : hoveredLink === link.href
                    ? "w-full bg-[#2E4C59]"
                    : "w-0 bg-[#2E4C59]"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="bg-[#2E4C59] rounded-[5px] w-[160px] content-center justify-around flex h-[35px]">
          <Link
            className="p-1 text-white hover:underline flex content-center justify-around w-[200px] items-center flex-row-reverse"
            href="/auth"
          >
            <Image
              src="/image/login.png"
              alt="Логотип"
              width={20}
              height={20}
            />
            Авторизация
          </Link>
        </div>
      </div>
    </header>
  );
}
