
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/lib/types';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        userNotifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(userNotifications);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching notifications: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
}
