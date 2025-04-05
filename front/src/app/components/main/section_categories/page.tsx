"use client";
import React from "react";
import CartCategory from "./cart_category/page";

export default function SectionCategories() {
  const categories = [
    {
      icon: "/image/programmingIcon.svg",
      label: "Программирование",
      count: 142,
    },
    { icon: "/image/designIcon.svg", label: "Дизайн", count: 87 },
    { icon: "/image/languageIcon.svg", label: "Иностранные языки", count: 307 },
    { icon: "/image/musicIcon.svg", label: "Музыка", count: 78 },
  ];

  return (
    <section className="bg-white text-black py-12 px-4 sm:py-16">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl text-center bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text font-bold">
          ПОПУЛЯРНЫЕ НАВЫКИ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CartCategory
              key={index}
              icon={category.icon}
              label={category.label}
              count={category.count}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
