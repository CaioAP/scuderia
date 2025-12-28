export const useApi = (): typeof $fetch => {
	const config = useRuntimeConfig();
	// const token = useCookie('token');

	return $fetch.create({
		baseURL: config.public.apiBase,
		onRequest({ options }) {
			console.log(options);
			// if (token.value) {
			//   options.headers = {
			//     ...options.headers,
			//     Authorization: `Bearer ${token.value}`
			//   };
			// }
		},
		onResponseError({ response }) {
			if (response.status === 401) {
				// Handle unauthorized
			}
		},
	});
};
