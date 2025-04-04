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
    <div className="bg-white shadow-2xl">
      <span>{label}</span>
      <Image
        src={icon}
        alt={label}
        width={24}
        height={24}
        className="object-cover"
        priority
      />
      <span>{count}</span>
    </div>
  );
};

export default CartCategory;
