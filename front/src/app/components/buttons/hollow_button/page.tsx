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
  className="w-[200px] relative bg-black text-white px-6 py-2 rounded-[20px] font-medium overflow-hidden group transition-all duration-300"
>

  <span className="relative z-10 group-hover:text-black duration-300">
    {label}
  </span>

  <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left duration-300 ease-in-out z-0" />
</button>
  );
};

export default HollowButton;
