"use client";
import { useNotificationManager } from "@/hooks/notification-context";

export default function Notifications() {
    const { notifications, addNotification, removeNotification } = useNotificationManager();
    return (
        <div className="flex flex-col absolute top-[90px] right-7  gap-5">
            {notifications.map((notification) => (
                <>
                {notification.status >=200 && notification.status <300 ?
                    <div key={notification.id} className="notification rounded-3xl p-4 bg-green-400 w-[30vh] trans">
                        <h3>{notification.title}</h3>
                        <p>{notification.description}</p>
                        
                        <button onClick={() => removeNotification(notification.id)}>Close</button>
                    </div>
                    :
                    notification.status >=400 && notification.status <500 ?
                    <div key={notification.id} className="notification rounded-3xl p-4 bg-red-400 w-[30vh] trans">
                        <h3>{notification.title}</h3>
                        <p>{notification.description}</p>
                        <button onClick={() => removeNotification(notification.id)}>Close</button>
                        
                    </div>
                    : <div>
                        <div key={notification.id} className="notification rounded-3xl p-4 bg-black w-[30vh] trans">
                            <h3>{notification.title}</h3>
                            <p>{notification.description}</p>
                            <button onClick={() => removeNotification(notification.id)}>Close</button>

                        </div>
                      </div>}
                </>
            ))}
        </div>
    );
}