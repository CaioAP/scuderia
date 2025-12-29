<template>
	<Form
		v-slot="$form"
		validateOnValueUpdate
		:resolver="resolver"
		:initialValues="initialValues"
		@submit="onFormSubmit"
		class="flex flex-col gap-4"
	>
		<div class="flex flex-col gap-1">
			<ClientOnly fallback-tag="div">
				<Editor
					v-model="message"
					name="message"
					placeholder="Escreva aqui sua mensagem para todos verem"
					editorStyle="height: 100px"
				>
					<template #toolbar>
						<EditorToolbar />
					</template>
				</Editor>
			</ClientOnly>
		</div>
		<Button
			type="submit"
			severity="primary"
			label="Enviar"
			:disabled="!$form.valid || !message"
		/>
	</Form>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import type { FormSubmitEvent } from '@primevue/forms/form';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const message: Ref<string> = ref('');

const initialValues = ref({
	message: '',
});

const resolver = ref(
	zodResolver(
		z.object({
			message: z.string().refine((val) => {
				const stripped = stripHtml(val);
				return stripped.length > 0;
			}),
		}),
	),
);

const onFormSubmit = ({ valid, states }: FormSubmitEvent) => {
	console.log(valid);
	console.log(states);
	if (valid) {
		toast.add({
			severity: 'success',
			summary: 'Form is submitted.',
			life: 3000,
		});
	}
};
</script>
