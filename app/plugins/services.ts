import { NotificationServiceMock } from '@/services/NotificationService';
import { MessageServiceMock } from '@/services/MessageService';
import type { Services } from '#shared/types/Services';

export default defineNuxtPlugin((nuxtApp) => {
  const notificationServiceMock = new NotificationServiceMock();
  const messageServiceMock = new MessageServiceMock();

  nuxtApp.vueApp.provide<Services>('services', {
    notification: notificationServiceMock,
    message: messageServiceMock,
  });
});
