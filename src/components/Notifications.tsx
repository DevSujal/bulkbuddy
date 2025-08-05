
'use client';

import { Bell, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { markNotificationAsRead } from "@/lib/data";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function Notifications() {
    const { user } = useAuth();
    const { notifications, loading } = useNotifications(user?.uid);
    
    const handleNotificationClick = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4 border-b">
                    <h4 className="text-sm font-medium">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {loading && <p className="p-4 text-sm text-muted-foreground">Loading...</p>}
                    {!loading && notifications.length === 0 && (
                        <p className="p-4 text-sm text-muted-foreground text-center">No new notifications</p>
                    )}
                    <ul className="divide-y">
                        {notifications.map(notification => (
                             <li key={notification.id} className={cn(!notification.read && "bg-secondary/50")}>
                                <Link
                                  href={notification.link}
                                  onClick={() => handleNotificationClick(notification.id)}
                                  className="block p-4 hover:bg-accent"
                                >
                                    <p className="text-sm">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                         {formatDistanceToNow(
                                            (notification.createdAt as Timestamp).toDate(),
                                            { addSuffix: true }
                                          )}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                 {!loading && notifications.length > 0 && (
                     <div className="p-2 border-t text-center">
                         <Link href="/notifications" className="text-sm text-primary hover:underline">
                            View all notifications
                         </Link>
                     </div>
                 )}
            </PopoverContent>
        </Popover>
    );
}
