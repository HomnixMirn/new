"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface NotificationManagerType {
  id: number;
  title: string;
  description: string | React.ReactNode;
  createdAt: Date;
  status: number; // Изменено на number
}

interface NotificationManagerContextType {
  notifications: NotificationManagerType[];
  addNotification: (notification: Omit<NotificationManagerType, "id">) => void;
  removeNotification: (id: number) => void;
}

const NotificationManagerContext =
  createContext<NotificationManagerContextType>(
    {} as NotificationManagerContextType
  );

export const NotificationManagerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationManagerType[]>(
    []
  );

  // Инициализация из localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(
            parsed.map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
            }))
          );
        } catch (e) {
          localStorage.removeItem("notifications");
        }
      }
    }
  }, []);

  // Автосохранение при изменениях
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = async (
    notification: Omit<NotificationManagerType, "id">
  ) => {
    try {
      const newNotification = {
        ...notification,
        id: Date.now(), // Используем timestamp для уникальности ID
      };

      setNotifications((prev) => [...prev, newNotification]);
    } catch (error) {
      console.error("Failed to add notification:", error);
    }
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationManagerContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationManagerContext.Provider>
  );
};

export const useNotificationManager = () => {
  const context = useContext(NotificationManagerContext);
  if (!context) {
    throw new Error(
      "useNotificationManager must be used within a NotificationManagerProvider"
    );
  }
  return context;
};
