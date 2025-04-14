import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useNotificationState = create<NotificationState>()(
  devtools(
    persist(
      (set) => ({
        addNotification(notification) {
          set((state) => ({
            notifications: [...state.notifications, notification],
          }));
        },
        removeNotification(notificationId) {
          set((state) => ({
            notifications: state.notifications.filter(
              (n) => n._id !== notificationId
            ),
          }));
        },
        clearNotifications() {
          set(() => ({
            notifications: [],
          }));
        },
        notifications: [],
        setNotifications(state: Partial<NotificationState>) {
          set((prev) => ({ ...prev, ...state }), undefined, {
            type: "notificationState/modify",
            state,
          });
        },
      }),
      { name: "notificationState" }
    ),
    { enabled: true }
  )
);
