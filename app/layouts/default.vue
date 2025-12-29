<template>
	<TheHeader />

	<main
		class="w-(--body-width) min-h-(--body-height) mt-16 ml-16 bg-primary-50"
	>
		<TheAside />

		<div class="w-full p-4 flex">
			<div class="max-w-7xl w-full mx-auto">
				<slot />
			</div>
		</div>
	</main>

	<TheFooter />
</template>

<script lang="ts" setup>
const items = ref([]);
</script>
