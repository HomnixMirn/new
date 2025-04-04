"use client";
import { useNotificationManager } from "@/hooks/notification-context";

export default function Notifications() {
    const { notifications, addNotification, removeNotification } = useNotificationManager();
    return (
        <div>
            {notifications.map((notification) => (
                <div key={notification.id} className="notification">
                    <h3>{notification.title}</h3>
                    <p>{notification.description}</p>
                    <button onClick={() => removeNotification(notification.id)}>Close</button>
                </div>
            ))}
        </div>
    );
}