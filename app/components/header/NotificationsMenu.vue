<template>
	<Menu
		:model="notifications"
		ref="notificationsMenu"
		id="notifications_menu"
		class="w-full md:w-md"
		popup
	>
		<template #start>
			<div class="flex items-center justify-between p-2">
				<p class="text-base text-gray-600">Notificações</p>
				<Button
					:loading="markNotificationsLoading"
					label="Marcar todas como lidas"
					variant="text"
					size="small"
					@click="markNotificationsAsRead"
				/>
			</div>
		</template>

		<template #item="{ item }">
			<div
				class="flex items-center gap-2 p-1"
				:class="{
					'cursor-pointer bg-primary-50 hover:bg-primary-100': unread.has(
						item.id,
					),
				}"
				@click="(event) => markAsRead(item, event)"
			>
				<Avatar
					v-if="item.avatar"
					:image="item.avatar"
					size="normal"
					shape="circle"
					class="size-10 min-w-10 ml-1 bg-primary-200"
				/>
				<Avatar
					v-else
					:label="item.initials"
					size="normal"
					shape="circle"
					class="size-10 min-w-10 ml-1 bg-primary-200"
				/>

				<div class="w-full mr-1 flex flex-col">
					<span class="text-sm">
						<strong>{{ item.name }}</strong> {{ item.label }}
					</span>
					<span class="text-xs text-end text-gray-400">
						{{ formatDateLastUpdated(item.createdAt) }}
					</span>
				</div>

				<ProgressSpinner
					v-show="item.loading"
					style="width: 2rem; height: 2rem; stroke: var(--p-primary)"
				/>
			</div>
		</template>
	</Menu>
</template>

<script setup lang="ts">
import type { Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';

interface Props {
	unread: Set<Number>;
	notifications: MenuItem[];
}

interface Emits {
	(e: 'on:item-loading', id: number, isLoading: boolean): void;
	(e: 'on:item-read', id: number): void;
	(e: 'on:all-read'): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const services = inject<Services>('services');

const toast = useToast();

const markNotificationsLoading: Ref<boolean> = ref(false);
const notificationsMenu: Ref<InstanceType<typeof Menu> | undefined> = ref();

const toggle = (event: PointerEvent) => {
	if (!notificationsMenu.value) return;
	notificationsMenu.value.toggle(event);
};

const markAsRead = async (item: MenuItem, event: PointerEvent) => {
	event.stopPropagation();
	if (!services || markNotificationsLoading.value) return;

	emits('on:item-loading', item.id, true);
	const { error } = await tryCatch(services.notification.markRead(item.id));

	if (error) {
		toast.add({
			severity: 'error',
			summary: 'Erro',
			detail: 'Não foi possível marcar a notificação como lida.',
			life: 3000,
		});
		emits('on:item-loading', item.id, false);
		return;
	}

	emits('on:item-read', item.id);
};

const markNotificationsAsRead = async () => {
	if (!services) return;

	markNotificationsLoading.value = true;
	const { error } = await tryCatch(services.notification.markAllRead());
	markNotificationsLoading.value = false;

	if (error) {
		toast.add({
			severity: 'error',
			summary: 'Erro',
			detail: 'Não foi possível marcar todas as notificações como lidas.',
			life: 3000,
		});
		return;
	}

	emits('on:all-read');
};

defineExpose({ toggle });
</script>

<style scoped lang="scss"></style>
