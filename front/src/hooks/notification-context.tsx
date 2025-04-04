"use client";
import React, { createContext, useContext, useState } from "react";
import axi from "@/utils/api";
import { API_URL } from "@/index";

interface NotificationManagerType {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    status: string;
}



interface NotificationManagerContextType {
    notifications: NotificationManagerType[];
    addNotification: (notification: NotificationManagerType) => void;
    removeNotification: (id: number) => void;
}

const NotificationManagerContext = createContext<NotificationManagerContextType>({} as NotificationManagerContextType);


export const NotificationManagerProvider = ({ children }: { children: React.ReactNode }) => {
    const savedNotifications = localStorage.getItem('notifications');
    const initialNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];
    const [notifications, setNotifications] = useState<NotificationManagerType[]>([...initialNotifications]);

    const addNotification = async (notification: NotificationManagerType) => {
        try {
            notification.id = notifications.length + 1;
            setNotifications([...notifications, notification]);
            const newNotifications = [...notifications, notification];
            localStorage.setItem('notifications', JSON.stringify(newNotifications));
            console.log(notifications);
        } catch (error) {
            addNotification({ id: notifications.length + 1, title: 'Ошибка', description: 'Произошла ошибка при добавлении уведомления', createdAt: new Date(), status: 'error' })
        }
    };

    const removeNotification = (id: number) => {
        setNotifications(notifications.filter((notification) => notification.id !== id));
        const newNotifications = [...notifications.filter((notification) => notification.id !== id)];
        console.log(newNotifications);
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
    };

    return (
        <NotificationManagerContext.Provider value={{ notifications, addNotification, removeNotification }}>
          {children}
        </NotificationManagerContext.Provider>
      );
}

export const useNotificationManager = () => {
  const context = useContext(NotificationManagerContext);
  if (!context) {
    throw new Error("useNotificationManager must be used within a NotificationManagerProvider");
  }
  return context;
};