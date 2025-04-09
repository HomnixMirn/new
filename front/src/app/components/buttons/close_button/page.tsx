"use client";
import { useState } from "react";
import Image from "next/image";

interface CloseButtonProps {
  onClick: () => void;
}

export default function CloseButton({ onClick }: CloseButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute top-3 right-3 text-2xl transition-colors"
      aria-label="Закрыть"
    >
      <Image
        width={24}
        height={24}
        src={
          hovered ? "/images/Icons/greyCross.svg" : "/images/Icons/cross.svg"
        }
        alt="Закрыть"
        className="transition-opacity duration-300"
      />
    </button>
  );
}
