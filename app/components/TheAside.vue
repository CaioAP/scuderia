<template>
	<section
		class="fixed inset-0 top-16 w-16 h-(--aside-height) p-2.5 flex flex-col gap-1 bg-white overflow-x-hidden overflow-y-auto transition-[width] ease-in-out duration-200"
		:class="expanded ? 'w-60 items-start' : ''"
	>
		<Button
			v-tooltip="expanded ? 'Retrair' : 'Expandir'"
			class="size-10 min-w-10 min-h-10 mb-4 p-2 rounded flex justify-center items-center text-gray-900 hover:cursor-pointer hover:bg-gray-100 hover:text-primary"
			variant="text"
			unstyled
			@click="toggleExpansion"
		>
			<NuxtIcon
				name="arrow_forward"
				class="text-2xl transition"
				:class="expanded ? '-rotate-180' : ''"
			/>
		</Button>

		<NuxtLink
			v-for="nav in navItems"
			:key="nav.name"
			v-tooltip="!expanded ? nav.name : ''"
			class="size-10 min-w-10 min-h-10 p-2 rounded flex justify-center items-center text-gray-500 hover:cursor-pointer hover:bg-gray-100 hover:text-primary"
			:class="expanded ? 'min-w-full justify-start gap-2' : ''"
			:to="{ name: nav.to }"
		>
			<NuxtIcon
				:name="nav.icon"
				class="text-2xl"
			/>
			<span v-show="expanded">{{ nav.name }}</span>
		</NuxtLink>
	</section>
</template>

<script setup lang="ts">
const expanded: Ref<boolean> = ref(false);

const navItems: NavItem[] = reactive([
	{ icon: 'home', name: 'Início', to: '' },
	{ icon: 'cake', name: 'Aniversários', to: '' },
	{ icon: 'content_paste_search', name: 'Pesquisas', to: '' },
	{ icon: 'campaign', name: 'Comunicados', to: '' },
	{ icon: 'feedback', name: 'Feedbacks', to: '' },
	{ icon: 'chart_data', name: 'Desenvolvimento', to: '' },
	{ icon: 'meeting_room', name: 'Reuniões', to: '' },
	{ icon: 'grading', name: 'Avaliações', to: '' },
	{ icon: 'corporate_fare', name: 'Empresa', to: '' },
	{ icon: 'account_tree', name: 'Organograma', to: '' },
	{ icon: 'groups', name: 'Colaboradores', to: '' },
	{ icon: 'hearing', name: 'Ouvidoria', to: '' },
]);

const toggleExpansion = () => {
	expanded.value = !expanded.value;
};
</script>

<style scoped></style>
