import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	css: ['./app/assets/css/main.css'],

	modules: ['@primevue/nuxt-module', '@nuxt/fonts', 'nuxt-icons'],

	vite: {
		plugins: [tailwindcss()],
	},

	primevue: {
		usePrimeVue: true,
		importTheme: { from: '@/themes/cilia.ts' },
		// options: {
		//   theme: {
		//     preset: Aura,
		//     options: {
		//       cssLayer: {
		//         name: "primevue",
		//         order: "theme, base, primevue",
		//       },
		//     },
		//   },
		// },
	},
});
