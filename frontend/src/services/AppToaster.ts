import { type NotificationData, notifications } from '@mantine/notifications';

export const showToast = (options: NotificationData) =>
  notifications.show({
    position: 'top-center',
    ...options,
  });
