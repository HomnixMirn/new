import React from "react";

interface SaveButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  label: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className="w-64 h-12 cursor-pointer
relative bg-[#F2F2F2] text-black px-6 py-2 rounded-lg font-medium overflow-hidden group transition-all duration-300 hover:bg-[#FF3495] flex justify-center items-center"
    >
      <span className="relative z-10 group-hover:text-white duration-300 text-[20px] font-bold tracking-normal leading-none text-center">
        {label}
      </span>
    </button>
  );
};

export default SaveButton;
