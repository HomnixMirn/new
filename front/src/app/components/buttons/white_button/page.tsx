"use client";
import React from "react";

interface WhiteButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  label: string;
}

const WhiteButton: React.FC<WhiteButtonProps> = ({
  type = "button",
  onClick,
  label,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-6 py-2 rounded-lg font-medium transition-colors duration-300 group border bg-white text-blue-500 border-white hover:bg-transparent hover:text-white"
      
    >
      {label}
    </button>
  );
};

export default WhiteButton;
