<template>
	<TheHeader />

	<main
		class="w-(--body-width) min-h-(--body-height) mt-16 ml-16 bg-primary-50"
	>
		<TheAside />

		<div class="p-4">
			<slot />
		</div>
	</main>

	<TheFooter />
</template>

<script lang="ts" setup>
const items = ref([]);
</script>
