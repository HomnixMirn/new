"use client";
import React from "react";
import Image from "next/image";

interface CartCategoryProps {
  icon: string;
  label: string;
  count: number;
}

const CartCategory: React.FC<CartCategoryProps> = ({ icon, label, count }) => {
  return (
    <div className="flex items-center justify-center p-4 rounded-xl shadow-lg  h-[]">
      <div className="flex flex-col items-center justify-center w-full">
        <Image
          src={icon}
          alt={label}
          width={100}
          height={100}
          className="object-cover mb-2"
          priority
        />
        <span className="text-lg font-semibold">{label}</span>
        <span className="text-xl font-bold">{count}</span>
      </div>
    </div>
  );
};

export default CartCategory;
