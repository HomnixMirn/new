"use client";
import CoverageMap from "./coverage_map/page";
import { useEffect, useState } from "react";
import { useNotificationManager } from "@/hooks/notification-context";
import Link from "next/link";
import Form from "./components/form/page";

export default function Home() {
  const { addNotification } = useNotificationManager();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        title: "Помогите нам улучшить качество нашей сети!",
        description: (
          <span
            key="feedback-link"
            onClick={() => setIsFormOpen(true)}
            className="cursor-pointer underline block"
          >
            Оставьте отзыв о вашей текущей сети
          </span>
        ),
        createdAt: new Date(),
        id: 0,
        status: "помогите улчшить сервис!",
      });
    }, 2* 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {isFormOpen && (
        <Form
          onClose={() => setIsLoginOpen(false)}
          onRegisterOpen={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
        />
      )}

      <CoverageMap />
    </div>
  );
}
