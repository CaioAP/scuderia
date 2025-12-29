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

		<div class="w-full my-auto flex flex-wrap justify-between gap-2 z-10">
			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ props.surveysMonth.length }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">este mês</span>
			</div>

			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ props.surveysTotal.length }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">total</span>
			</div>

			<div>
				<span class="font-semibold text-4xl text-primary">
					{{ surveysTotalAnswered.length }}
				</span>
				<span class="ml-1.5 text-base text-gray-500">respondidas</span>
			</div>
		</div>
	</HomeInsight>
</template>

<script setup lang="ts">
import type { Survey } from '#shared/types/Survey';

interface Props {
	surveysMonth: Survey[];
	surveysTotal: Survey[];
}

const props = defineProps<Props>();

const surveysTotalAnswered = computed(() =>
	props.surveysTotal.filter((s) => s.answered),
);
</script>

<style scoped></style>
