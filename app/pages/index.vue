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
				class="shadow-md shadow-primary-200"
				:birthdays-today="birthdays.today"
				:birthdays-month="birthdays.month"
			/>
			<HomeInsightFeedbacks
				class="shadow-md shadow-primary-200"
				:feedbacks-sent="feedbacks.sent"
				:feedbacks-received="feedbacks.received"
				:latest-feedback-user="feedbacks.latestUser"
			/>
			<HomeInsightSurveys
				class="shadow-md shadow-primary-200"
				:surveys-month="surveys.month"
				:surveys-total="surveys.total"
				:surveys-answered="surveys.answered"
			/>
			<HomeInsightAnnouncements
				class="shadow-md shadow-primary-200"
				:announcements-month="announcements.month"
				:announcements-total="announcements.total"
			/>
		</div>

		<div class="w-full grid grid-cols-1 items-center gap-4 lg:grid-cols-5">
			<div
				class="w-full h-40 row-start-2 flex flex-col justify-center items-center rounded-lg border border-gray-200 bg-white lg:col-span-3 lg:row-start-1"
			>
				<h2 class="text-center">O que está pensando hoje?</h2>
				<InputText placeholder="Escreva uma mensagem" />
			</div>
			<div
				class="w-full h-40 flex flex-col justify-center items-center rounded-lg border border-gray-200 bg-white lg:col-span-2"
			>
				<h2>Dados do usuário</h2>
			</div>
		</div>

		<div
			class="w-full h-40 flex justify-center items-center rounded-lg border border-gray-200 bg-white"
		>
			<h3>Lista de mensagens</h3>
		</div>
	</div>
</template>

<script setup lang="ts">
const reminder = ref();

const birthdays = ref({
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

const surveys = ref({
	month: 3,
	total: 14,
	answered: 10,
});

const announcements = ref({
	month: 3,
	total: 10,
});

const feedbacks = ref({
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
</script>

<style scoped lang="scss"></style>
