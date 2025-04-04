"use client";
import { useNotificationManager } from "@/hooks/notification-context";

export default function Notifications() {
    const { notifications, addNotification, removeNotification } = useNotificationManager();
    return (
        <div className="flex flex-col absolute top-[90px] right-7  gap-5">
            {notifications.map((notification) => (
                <div key={notification.id} className="notification rounded-3xl p-4 bg-amber-400 w-[30vh] trans">
                    <h3>{notification.title}</h3>
                    <p>{notification.description}</p>
                    <button onClick={() => removeNotification(notification.id)}>Close</button>
                </div>
            ))}
        </div>
    );
}