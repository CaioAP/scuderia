<template>
	<HeaderNotificationsButton
		:unread="notificationsUnread"
		@toggle="toggleNotificationsMenu"
	/>

	<HeaderNotificationsMenu
		ref="notificationsMenu"
		:unread="notificationsUnread"
		:notifications="notifications"
		@on:item-loading="setNotificationLoading"
		@on:item-read="markNotificationRead"
		@on:all-read="markAllNotificationsRead"
	/>
</template>

<script setup lang="ts">
import type { Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import type { Services } from '#shared/types/Services';
import type { Notification } from '#shared/types/Notification';

const services = inject<Services>('services');

const { data: notificationsData } = await useAsyncData<Notification[]>(
	'notifications',
	async () => {
		if (!services) return new Promise((res) => res([]));

		const { data, error } = await tryCatch(
			services.notification.getMostRecent(),
		);

		if (error) {
			return [];
		}

		return data.map((d) => {
			d.loading = false;
			return d;
		});
	},
);

const notificationsMenu: Ref<InstanceType<typeof Menu> | undefined> = ref();
const notifications: Ref<MenuItem[]> = ref([
	{
		separator: true,
	},
	...(notificationsData.value ?? []),
]);

const notificationsUnread = computed(() => {
	const unreadNotificationsId: number[] = notifications.value
		.filter((item) => item.separator !== true && !item.read)
		.map((item) => item.id);

	return new Set(unreadNotificationsId);
});

const toggleNotificationsMenu = (event: PointerEvent) => {
	if (!notificationsMenu.value) return;
	notificationsMenu.value.toggle(event);
};

const setNotificationLoading = (id: number, isLoading: boolean) => {
	notifications.value.forEach((notify) => {
		if (notify.id === id) notify.loading = isLoading;
	});
};

const markNotificationRead = (id: number) => {
	notifications.value.forEach((notify) => {
		if (notify.id === id) {
			notify.read = true;
			notify.loading = false;
		}
	});
};

const markAllNotificationsRead = () => {
	notifications.value.forEach((notify) => {
		notify.read = true;
	});
};
</script>

<style scoped></style>
