<template>
	<HomeInsight
		title="Aniversariantes"
		to=""
	>
		<template #background>
			<NuxtImg
				src="/images/balloons.png"
				class="w-full h-full object-cover"
			/>
		</template>

		<div class="w-full my-auto flex justify-between items-center gap-2 z-10">
			<div>
				<div>
					<span class="font-semibold text-4xl text-primary">
						{{ props.birthdaysToday.length }}
					</span>
					<span class="ml-1.5 text-base text-gray-500">hoje</span>
				</div>

				<AvatarGroup
					v-tooltip="birthdaysTodayNames"
					class="w-fit mt-2"
				>
					<BaseAvatar
						v-for="user in birthdaysTodayAvatars"
						:key="user.id"
						:image="user.avatar"
						class="size-9"
					/>
					<BaseAvatar
						v-if="birthdaysTodayLeft > 0"
						:label="`+${birthdaysTodayLeft}`"
						class="size-9"
					/>
				</AvatarGroup>
			</div>

			<div>
				<div>
					<span class="font-semibold text-4xl text-primary">
						{{ props.birthdaysMonth.length }}
					</span>
					<span class="ml-1.5 text-base text-gray-500">este mês</span>
				</div>

				<AvatarGroup
					v-tooltip="birthdaysMonthNames"
					class="w-fit mt-2"
				>
					<BaseAvatar
						v-for="user in birthdaysMonthAvatars"
						:key="user.id"
						:image="user.avatar"
						class="size-9"
					/>
					<BaseAvatar
						v-if="birthdaysMonthLeft > 0"
						:label="`+${birthdaysMonthLeft}`"
						class="size-9"
					/>
				</AvatarGroup>
			</div>
		</div>
	</HomeInsight>
</template>

<script setup lang="ts">
import type { User } from '#shared/types/User';

interface Props {
	birthdaysToday: User[];
	birthdaysMonth: User[];
}

const props = defineProps<Props>();

const birthdaysTodayNames = computed(() =>
	props.birthdaysToday.reduce((prev, curr, i) => {
		if (i === 0) {
			return curr.name;
		}

		if (i === props.birthdaysToday.length - 1) {
			return `${prev} e\n ${curr.name}`;
		}

		return `${prev},\n${curr.name}`;
	}, ''),
);
const birthdaysMonthNames = computed(() =>
	props.birthdaysMonth.reduce((prev, curr, i) => {
		if (i === 0) {
			return curr.name;
		}

		if (i === props.birthdaysMonth.length - 1) {
			return `${prev} e\n ${curr.name}`;
		}

		return `${prev},\n${curr.name}`;
	}, ''),
);

const birthdaysTodayAvatars = computed(() =>
	props.birthdaysToday.filter((_, i) => i < 3),
);
const birthdaysMonthAvatars = computed(() =>
	props.birthdaysMonth.filter((_, i) => i < 3),
);

const birthdaysTodayLeft = computed(
	() => props.birthdaysToday.length - birthdaysTodayAvatars.value.length,
);
const birthdaysMonthLeft = computed(
	() => props.birthdaysMonth.length - birthdaysMonthAvatars.value.length,
);
</script>

<style scoped></style>
