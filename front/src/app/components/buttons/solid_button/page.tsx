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
            ? "bg-white text-blue-500 text-black border-white hover:bg-transparent hover:text-white"
            : "bg-white text-black border border-transparent hover:bg-transparent hover:border-blue-500 hover:text-white" 
        }
      `}
    >
      {label}
    </button>
  );
};

export default SolidButton;