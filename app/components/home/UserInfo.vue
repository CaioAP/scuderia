<template>
	<div class="p-4">
		<div class="flex items-center gap-4">
			<BaseAvatar
				class="size-24 min-w-24 rounded-lg overflow-hidden"
				:image="props.user.avatar"
				:label="props.user.label"
				shape="square"
			/>

			<div class="flex flex-col">
				<h2 class="text-xl text-gray-700">{{ props.user.name }}</h2>
				<p class="text-base text-gray-500 leading-tight">
					{{ props.user.jobPosition }}
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	user: User;
}

const props = defineProps<Props>();
</script>
