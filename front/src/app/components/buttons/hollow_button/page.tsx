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
      className="relative bg-transparent border-2 border-white text-white px-6 py-2 rounded-lg font-medium overflow-hidden group"
    >
      <span className="relative z-10 group-hover:text-blue-500 transition-colors duration-300">
        {label}
      </span>

      <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-in-out z-0" />
    </button>
  );
};

export default HollowButton;
