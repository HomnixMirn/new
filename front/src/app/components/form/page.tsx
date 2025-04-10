"use client";
import React, { useState, useEffect } from "react";
import axi from "@/utils/api";
import { useNotificationManager } from "@/hooks/notification-context";
import BlackCloseButton from "@/app/components/buttons/black_close_button/page";
import SaveButton from "../buttons/save_button/page";
import AddStarRating from "@/app/components/star_rating/add_star_rating";
import { useGEO } from "@/hooks/geo-context";

interface RatingFormProps {
  onClose: () => void;
}

export default function RatingForm({ onClose }: RatingFormProps) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { addNotification } = useNotificationManager();

  const {GEO} = useGEO()
  console.log(GEO)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!GEO) {
      setError("Ожидание получения геопозиции...");
      return;
    }

    if (rating === 0) {
      setError("Пожалуйста, поставьте оценку");
      return;
    }

    setIsLoading(true);
    try {
      await axi.post("/map/add_network_comment", {
        text: comment.trim(),
        latitude: GEO.latitude,
        longitude: GEO.longitude,
        rating: rating,
      });

    onClose();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-[16px] w-[432px] relative p-6">
        <BlackCloseButton onClick={onClose} />
        <p
          className="text-[32px] font-['T2_Halvar_Breit'] font-black leading-none mb-6"
          style={{ width: 324, height: 74 }}
        >
          Оставить оценку качества сети
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 items-center"
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ваш комментарий"
            className="w-full h-[140px] p-3 bg-[#F2F2F2] rounded-lg resize-none border-none focus:ring-2 focus:ring-blue-500"
            maxLength={500}
          />

          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-600">Поставьте оценку</p>
            <AddStarRating value={rating} onChange={setRating} />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <SaveButton
            label={isLoading ? "Отправка..." : "Сохранить"}
            onClick={handleSubmit}
            type="submit"
          />
        </form>
      </div>
    </div>
  );
}
