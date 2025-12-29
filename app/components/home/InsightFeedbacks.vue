<template>
	<HomeInsight
		title="Feedbacks"
		to=""
	>
		<template #background>
			<NuxtImg
				src="/images/review.png"
				class="w-full h-full object-cover opacity-75"
			/>
		</template>

		<div class="w-full flex flex-col gap-1.5 z-10">
			<div class="w-full flex justify-between gap-2">
				<div>
					<span class="font-semibold text-4xl text-primary">
						{{ props.feedbacksSent }}
					</span>
					<span class="ml-1.5 text-base text-gray-500">enviados</span>
				</div>

				<div>
					<span class="font-semibold text-4xl text-primary">
						{{ props.feedbacksReceived }}
					</span>
					<span class="ml-1.5 text-base text-gray-500">recebidos</span>
				</div>
			</div>

			<div
				v-if="props.latestFeedbackUser"
				class="flex items-center gap-2"
			>
				<BaseAvatar
					:image="props.latestFeedbackUser.avatar"
					:label="props.latestFeedbackUser.label"
					class="size-9 min-w-9"
				/>

				<span class="text-base text-gray-500">
					<strong>{{ props.latestFeedbackUser.name }}</strong> enviou seu último
					feedback
				</span>
			</div>
		</div>
	</HomeInsight>
</template>

<script setup lang="ts">
interface Props {
	feedbacksSent: number;
	feedbacksReceived: number;
	latestFeedbackUser?: User;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
