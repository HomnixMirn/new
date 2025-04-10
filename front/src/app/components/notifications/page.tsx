"use client";
import { useNotificationManager } from "@/hooks/notification-context";
import { useEffect, useRef, useState } from "react";

export default function Notifications() {
  const { notifications, removeNotification } = useNotificationManager();
  const notificationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [animatedNotifications, setAnimatedNotifications] = useState<number[]>(
    []
  );

  useEffect(() => {
    notificationRefs.current = notificationRefs.current.slice(
      0,
      notifications.length
    );
  }, [notifications]);

  // Функция для получения текста статуса
  const getStatusText = (status: number) => {
    if (status >= 200 && status < 300) return "Успешно";
    if (status >= 400 && status < 500) return `Ошибка ${status}`;
    return `Статус: ${status}`;
  };

  const handleAnimationEnd = (id: number) => {
    setAnimatedNotifications((prev) => [...prev, id]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3">
      {notifications.map((notification, index) => {
        let bgColor = "bg-gray-800";
        let textColor = "text-white";
        let borderColor = "border-gray-600";
        let statusText = getStatusText(notification.status);

        if (notification.status >= 200 && notification.status < 300) {
          bgColor = "bg-green-800/90";
          textColor = "text-green-50";
          borderColor = "border-green-600";
        } else if (notification.status >= 400 && notification.status < 500) {
          bgColor = "bg-red-800/90";
          textColor = "text-red-50";
          borderColor = "border-red-600";
        }

        const isAnimated = animatedNotifications.includes(notification.id);

        return (
          <div
            key={notification.id}
            ref={(el) => (notificationRefs.current[index] = el)}
            onAnimationEnd={() => handleAnimationEnd(notification.id)}
            className={`${bgColor} ${textColor} border ${borderColor} rounded-xl p-4 w-80 shadow-lg backdrop-blur-sm transform transition-all duration-500 ${
              !isAnimated ? "animate-slideIn" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
                <p className="text-sm opacity-90">{notification.description}</p>
                <p className="text-xs mt-1 font-mono opacity-80">
                  {statusText}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className={`${textColor} hover:opacity-70 transition-opacity ml-2`}
                aria-label="Close notification"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs opacity-70">
                {new Date(notification.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
