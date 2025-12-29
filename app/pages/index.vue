<template>
	<div class="w-full flex flex-col gap-4">
		<NuxtImg
			src="/images/home_banner.png"
			class="w-full rounded-lg border border-gray-200 shadow-md shadow-primary-200"
		/>

		<div
			v-if="reminder"
			class="w-full h-40 rounded-lg border border-gray-200 bg-white"
		>
			<h1 class="w-full text-center leading-40">LEMBRETE</h1>
		</div>

		<div class="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<HomeInsightBirthdays
				class="shadow-md shadow-primary-200 hover:shadow-lg hover:-translate-y-1"
				:birthdays-today="birthdays.today"
				:birthdays-month="birthdays.month"
			/>
			<HomeInsightFeedbacks
				class="shadow-md shadow-primary-200 hover:shadow-lg hover:-translate-y-1"
				:feedbacks-sent="feedbacks.sent"
				:feedbacks-received="feedbacks.received"
				:latest-feedback-user="feedbacks.latestUser"
			/>
			<HomeInsightSurveys
				class="shadow-md shadow-primary-200 hover:shadow-lg hover:-translate-y-1"
				:surveys-month="surveys.month"
				:surveys-total="surveys.total"
				:surveys-answered="surveys.answered"
			/>
			<HomeInsightAnnouncements
				class="shadow-md shadow-primary-200 hover:shadow-lg hover:-translate-y-1"
				:announcements-month="announcements.month"
				:announcements-total="announcements.total"
			/>
		</div>

		<div class="w-full grid grid-cols-1 items-center gap-4 lg:grid-cols-5">
			<HomeMessage
				class="w-full row-start-2 flex flex-col rounded-lg bg-white shadow-md shadow-primary-200 lg:col-span-3 lg:row-start-1"
			/>

			<HomeUserInfo
				class="w-full h-full rounded-lg bg-white lg:col-span-2 shadow-md shadow-primary-200"
				:user="userInfo"
			/>
		</div>

		<div
			class="w-full h-40 flex justify-center items-center rounded-lg border border-gray-200 bg-white"
		>
			<h3>Lista de mensagens</h3>
		</div>
	</div>
</template>

<script setup lang="ts">
import type {
	HomeCardBirthdays,
	HomeCardSurveys,
	HomeCardAnnouncements,
	HomeCardFeedbacks,
} from '#shared/types/HomeCards';

const reminder = ref();

const birthdays: Ref<HomeCardBirthdays> = ref({
	today: [
		{
			id: 1,
			name: 'Caio Alfonso',
			label: 'CA',
			avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
		},
	],
	month: [
		{
			id: 1,
			name: 'Caio Alfonso',
			label: 'CA',
			avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
		},
		{
			id: 2,
			name: 'Caio Alfonso',
			label: 'CA',
			avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
		},
		{
			id: 3,
			name: 'Caio Alfonso',
			label: 'CA',
			avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
		},
		{
			id: 4,
			name: 'Caio Alfonso',
			label: 'CA',
			avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
		},
		{
			id: 5,
			name: 'Caio Alfonso',
			label: 'CA',
			avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
		},
	],
});

const surveys: Ref<HomeCardSurveys> = ref({
	month: 3,
	total: 14,
	answered: 10,
});

const announcements: Ref<HomeCardAnnouncements> = ref({
	month: 3,
	total: 10,
});

const feedbacks: Ref<HomeCardFeedbacks> = ref({
	sent: 5,
	received: 20,
	latestUser: {
		id: 1,
		name: 'Fulana da Silva',
		avatar:
			'https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png',
		label: 'FS',
	},
});

const userInfo: Ref<User> = ref({
	id: 1,
	name: 'Caio Alfonso de Paula',
	label: 'CA',
	avatar:
		'https://dhzrp5s22uvyk.cloudfront.net/companies/8009/profiles/1675321/avatar/f0360690909b00f66e70e56440d07fa5.png',
	jobPosition: 'Analista de Desenvolvimento de Software',
});
</script>

<style scoped lang="scss"></style>
