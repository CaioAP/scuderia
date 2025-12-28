export default defineNuxtPlugin((nuxtApp) => {
	const notificationServiceMock = new NotificationServiceMock();

	nuxtApp.vueApp.provide<Services>('services', {
		notification: notificationServiceMock,
	});
});
