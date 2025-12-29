<template>
	<Avatar
		v-if="props.image"
		:image="props.image"
		:shape="props.shape"
	/>
	<Avatar
		v-else-if="props.icon"
		:shape="props.shape"
	>
		<template #icon>
			<NuxtIcon :name="props.icon" />
		</template>
	</Avatar>
	<Avatar
		v-else
		:label="props.label"
		:shape="props.shape"
	/>
</template>

<script setup lang="ts">
interface Props {
	image?: string;
	icon?: string;
	label?: string;
	shape?: 'square' | 'circle';
}

const props = withDefaults(defineProps<Props>(), {
	shape: 'circle',
});
</script>

<style scoped></style>
