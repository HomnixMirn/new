"use client";
import { useState } from "react";
import Image from "next/image";

interface BlackCloseButtonProps {
  onClick: () => void;
}

export default function BlackCloseButton({ onClick }: BlackCloseButtonProps) {
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
          hovered
            ? "/images/Icons/greyCross.svg"
            : "/images/Icons/blackCrossIcon.svg"
        }
        alt="Закрыть"
        className="transition-opacity duration-300"
      />
    </button>
  );
}
