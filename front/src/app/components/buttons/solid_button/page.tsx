"use client";
import React from "react";

interface SolidButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  label: string;
  color?: "white" | "gradient";
}

const SolidButton: React.FC<SolidButtonProps> = ({
  type = "button",
  onClick,
  label,
  color = "white",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-white px-6 py-2 rounded-lg font-medium transition-all duration-300 group border 
        ${
          color === "white"
            ? "bg-white text-blue-500 border-white hover:bg-transparent hover:text-white"
            : "bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 border border-transparent hover:bg-transparent hover:border-blue-500"
        }
      `}
    >
      {label}
    </button>
  );
};

export default SolidButton;
