<template>
	<HomeInsight
		title="Pesquisas"
		to=""
	>
		<template #background>
			<NuxtImg
				src="/images/good-feedback.png"
				class="w-full h-full object-cover"
			/>
		</template>

		<div class="w-full flex flex-wrap justify-between gap-2 z-10">
			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ props.surveysMonth }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">este mês</span>
			</div>

			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ props.surveysTotal }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">total</span>
			</div>

			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ surveysAnswered }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">respondidas</span>
			</div>
		</div>
	</HomeInsight>
</template>

<script setup lang="ts">
interface Props {
	surveysMonth: number;
	surveysTotal: number;
	surveysAnswered: number;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
