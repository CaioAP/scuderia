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
          :disabled="submitting"
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
      :disabled="!$form.valid || !message || submitting"
      :loading="submitting"
    />
  </Form>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import type { FormSubmitEvent } from '@primevue/forms/form';
import { useToast } from 'primevue/usetoast';
import type { Services } from '#shared/types/Services';

const toast = useToast();

// Inject services
const services = inject<Services>('services');
if (!services) {
  throw new Error('Services not provided');
}

// Define emits for parent communication
const emit = defineEmits<{
  messageCreated: [message: any];
}>();

const message: Ref<string> = ref('');
const submitting = ref(false);

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

const onFormSubmit = async ({ valid, states }: FormSubmitEvent) => {
  if (!valid || submitting.value) return;

  submitting.value = true;

  try {
    // Create the message using the service
    const newMessage = await services.message.createMessage(message.value);

    // Show success toast
    toast.add({
      severity: 'success',
      summary: 'Mensagem enviada!',
      detail: 'Sua mensagem foi compartilhada com sucesso.',
      life: 3000,
    });

    // Reset the form
    message.value = '';
    initialValues.value.message = '';

    // Emit event to notify parent components
    emit('messageCreated', newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro ao enviar mensagem',
      detail: 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.',
      life: 5000,
    });
  } finally {
    submitting.value = false;
  }
};
</script>
