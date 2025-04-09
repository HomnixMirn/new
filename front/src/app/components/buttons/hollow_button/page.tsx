import React from "react";

interface HollowButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  label: string;
}

const HollowButton: React.FC<HollowButtonProps> = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className="w-64 h-12
relative bg-black text-white px-6 py-2 rounded-[20px] font-medium overflow-hidden group transition-all duration-300 hover:bg-[#FF3495] flex justify-center items-center"
    >
      <span className="relative z-10 group-hover:text-white duration-300 text-[20px] font-extrabold tracking-normal leading-none text-center">
        {label}
      </span>
    </button>
  );
};

export default HollowButton;
