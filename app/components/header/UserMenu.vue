<template>
	<Button
		type="button"
		variant="text"
		class="py-1 flex items-center gap-2 text-end"
		aria-haspopup="true"
		aria-controls="user_menu"
		@click="toggleUserMenu"
	>
		<div>
			<p class="text-sm text-gray-700">Caio Alfonso</p>
			<p class="text-xs text-gray-500">Cilia</p>
		</div>
		<Avatar
			label="CA"
			size="normal"
			shape="circle"
			class="size-10 ml-1 bg-primary-200"
		/>
		<NuxtIcon
			name="keyboard_arrow_down"
			class="text-lg text-gray-500 transition ease-in-out"
			:class="{ 'rotate-180': userMenuToggled }"
		/>
	</Button>

	<Menu
		:model="userMenuItems"
		ref="userMenu"
		id="user_menu"
		class="w-full md:w-60"
		popup
		@show="userMenuToggled = true"
		@hide="userMenuToggled = false"
	>
		<template #itemicon="{ item }">
			<NuxtIcon :name="item.icon" />
		</template>
	</Menu>
</template>

<script setup lang="ts">
import type { Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';

const userMenuToggled: Ref<boolean> = ref(false);
const userMenu: Ref<InstanceType<typeof Menu> | undefined> = ref();

const userMenuItems: MenuItem[] = reactive([
	{
		label: 'Meu perfil',
		icon: 'person',
	},
	{
		label: 'Minha carreira',
		icon: 'business_center',
	},
	{
		separator: true,
	},
	{
		label: 'Sair',
		icon: 'logout',
	},
]);

const toggleUserMenu = (event: PointerEvent) => {
	if (!userMenu.value) return;
	userMenu.value.toggle(event);
};
</script>

<style scoped></style>
