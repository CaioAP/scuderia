<template>
	<OverlayBadge
		v-if="unread.size"
		:value="unread.size"
		size="small"
		severity="danger"
	>
		<Button
			class="text-2xl text-gray-500"
			variant="text"
			rounded
			@click="toggleNotificationsMenu"
		>
			<template #icon>
				<NuxtIcon name="notifications_active" />
			</template>
		</Button>
	</OverlayBadge>

	<Button
		v-else
		class="text-2xl text-gray-500"
		variant="text"
		rounded
		@click="toggleNotificationsMenu"
	>
		<template #icon>
			<NuxtIcon name="notifications" />
		</template>
	</Button>
</template>

<script setup lang="ts">
interface Props {
	unread: Set<number>;
}

interface Emits {
	(e: 'toggle', event: PointerEvent): any;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const toggleNotificationsMenu = (event: PointerEvent) => {
	emits('toggle', event);
};
</script>

<style scoped></style>
