<template>
	<HomeInsight
		title="Comunicados"
		to=""
	>
		<template #background>
			<NuxtImg
				src="/images/marketing.png"
				class="w-full h-full object-cover"
			/>
		</template>

		<div class="w-full flex flex-wrap justify-between gap-2 z-10">
			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ props.announcementsMonth }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">este mês</span>
			</div>

			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ props.announcementsTotal }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">total</span>
			</div>
		</div>
	</HomeInsight>
</template>

<script setup lang="ts">
interface Props {
	announcementsMonth: number;
	announcementsTotal: number;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
