<template>
	<NuxtLink
		class="rounded-lg overflow-hidden"
		:to="{ name: props.to }"
	>
		<div class="w-full h-full px-3 py-2 relative flex flex-col gap-6 bg-white">
			<div class="absolute inset-0 opacity-10 z-0">
				<slot name="background" />
			</div>

			<h2 class="text-lg text-gray-700">{{ props.title }}</h2>

			<slot />
		</div>
	</NuxtLink>
</template>

<script setup lang="ts">
import type { RouteRecordName } from 'vue-router';

interface Props {
	title: string;
	to: RouteRecordName;
	background?: string;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
