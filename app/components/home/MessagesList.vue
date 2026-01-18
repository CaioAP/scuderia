<template>
  <div class="w-full rounded-lg bg-white shadow-md shadow-primary-200">
    <!-- Header -->
    <div class="px-4 pt-4 pb-2">
      <h2 class="text-lg text-gray-700">Mensagens da Equipe</h2>
      <p class="text-sm text-gray-500">
        Acompanhe as últimas comunicações e interaja com seus colegas
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="px-4 pb-4"
    >
      <div class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="animate-pulse bg-gray-100 rounded-lg p-4"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="px-4 pb-4"
    >
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <h3 class="text-sm font-medium text-red-800">
            Erro ao carregar mensagens
          </h3>
        </div>
        <p class="text-sm text-red-700 mb-3">{{ error }}</p>
        <button
          @click="fetchMessages"
          class="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <!-- Messages List -->
    <div
      v-else-if="messages.length > 0"
      class="px-4 pb-4"
    >
      <div class="space-y-4">
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @like-changed="handleLikeChanged"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="px-4 pb-4"
    >
      <div class="text-center py-8">
        <svg
          class="w-12 h-12 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-500 mb-2">
          Nenhuma mensagem ainda
        </h3>
        <p class="text-sm text-gray-400">
          Seja o primeiro a compartilhar algo com a equipe!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { Message } from '#shared/types/Message';
import type { Services } from '#shared/types/Services';
import MessageItem from './message/MessageItem.vue';

// Inject services
const services = inject<Services>('services');
if (!services) {
  throw new Error('Services not provided');
}

// Reactive state
const messages = ref<Message[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Fetch messages function
const fetchMessages = async () => {
  loading.value = true;
  error.value = null;

  try {
    const fetchedMessages = await services.message.getMessages();
    messages.value = fetchedMessages;
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Ocorreu um erro inesperado ao carregar as mensagens';
    console.error('Error fetching messages:', err);
  } finally {
    loading.value = false;
  }
};

// Handle like changes from MessageItem
const handleLikeChanged = async (data: {
  messageId: number;
  isLiked: boolean;
  likeCount: number;
}) => {
  // Find the message and update it optimistically
  const messageIndex = messages.value.findIndex((m) => m.id === data.messageId);
  if (messageIndex !== -1) {
    const message = messages.value[messageIndex]!;

    // Update the message with new like state
    messages.value[messageIndex] = {
      ...message,
      isLiked: data.isLiked,
      likeCount: data.likeCount,
      loading: false, // Ensure loading state is cleared
    };
  }
};

// Refresh messages (for integration with form submission)
const refreshMessages = async () => {
  await fetchMessages();
};

// Expose refresh method for parent components
defineExpose({
  refreshMessages,
});

// Fetch messages on component mount
onMounted(() => {
  fetchMessages();
});
</script>

<style scoped>
/* Custom animations for loading states */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
