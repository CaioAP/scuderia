<template>
	<header
		class="fixed inset-0 w-full h-16 flex items-center px-5 py-2 font-bold bg-white shadow-md shadow-primary-100"
	>
		<div class="flex items-center gap-1">
			<NuxtIcon
				name="logo"
				class="text-primary text-3xl"
			/>
			<span class="logo-text text-lg text-primary">Scuderia</span>
		</div>

		<div class="ml-auto flex items-center gap-4">
			<HeaderNotifications />
		</div>

		<div class="ml-8 flex items-center gap-4">
			<HeaderUserMenu />
		</div>
	</header>
</template>

<script setup lang="ts"></script>

<style scoped></style>
