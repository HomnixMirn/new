"use client";
import React from "react";

interface SolidButtonProps {
  onClick: () => void;
  label: string;
}

const SolidButton: React.FC<SolidButtonProps> = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-white hover:bg-transparent px-6 py-2 rounded-lg font-medium transition-colors duration-300 group"
    >
      <span className="text-blue-500 group-hover:text-white">{label}</span>
    </button>
  );
};

export default SolidButton;
