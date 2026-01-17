import { MessageServiceMock } from '@/services/MessageService';

export default defineNuxtPlugin((nuxtApp) => {
  const notificationServiceMock = new NotificationServiceMock();
  const messageServiceMock = new MessageServiceMock();

  nuxtApp.vueApp.provide<Services>('services', {
    notification: notificationServiceMock,
    message: messageServiceMock,
  });
});
