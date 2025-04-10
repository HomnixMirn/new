"use client";
import CoverageMap from "./coverage_map/page";
import { useEffect, useState } from "react";
import { useNotificationManager } from "@/hooks/notification-context";
import Link from "next/link";
import Form from "./components/form/page";


export default function Home() {
  const {addNotification} = useNotificationManager()
  const [isFormOpen, setIsFormOpen] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        title: "Помогите нам улучшить качество нашей сети!",
        description: <p key={0} onClick={() => setIsFormOpen(true)} className=" underline">Оставте отзыв о вашей текущей сети</p>,
        createdAt: new Date(),
        id: 0,
        status: 'помогите улчшить сервис!',
      })
      // Place any additional code you want to run here
    },  5 * 1000); // 2 minutes in milliseconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {isFormOpen && (
              <Form
                onClose={() => setIsLoginOpen(false)}
                onLoginSuccess={handleLoginSuccess}
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
