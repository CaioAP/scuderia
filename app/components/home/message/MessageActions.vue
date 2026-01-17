<template>
  <div class="flex items-center gap-2">
    <Button
      :variant="isLiked ? 'filled' : 'outlined'"
      :severity="isLiked ? 'primary' : 'secondary'"
      size="small"
      rounded
      :loading="loading"
      :disabled="loading"
      @click="handleLikeToggle"
      class="transition-all duration-200"
      :class="{
        'hover:scale-105': !loading,
        'opacity-50': loading,
      }"
    >
      <template #icon>
        <svg
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          :class="{
            'text-red-500': isLiked,
            'text-gray-400': !isLiked,
          }"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </template>
    </Button>

    <span
      class="text-sm font-medium text-gray-600 transition-colors duration-200"
      :class="{
        'text-primary-600': isLiked,
        'opacity-50': loading,
      }"
    >
      {{ formatLikeCount(likeCount) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import type { Services } from '#shared/types/Services';

interface Props {
  messageId: number;
  likeCount: number;
  isLiked: boolean;
  loading?: boolean;
}

interface Emits {
  (
    e: 'like-changed',
    data: { messageId: number; isLiked: boolean; likeCount: number },
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emits = defineEmits<Emits>();

const services = inject<Services>('services');
const toast = useToast();

const loading = ref(props.loading);
const optimisticLikeCount = ref(props.likeCount);
const optimisticIsLiked = ref(props.isLiked);

// Watch for prop changes to sync optimistic state
watch(
  () => props.likeCount,
  (newCount) => {
    optimisticLikeCount.value = newCount;
  },
);

watch(
  () => props.isLiked,
  (newIsLiked) => {
    optimisticIsLiked.value = newIsLiked;
  },
);

const handleLikeToggle = async () => {
  if (!services?.message || loading.value) {
    return;
  }

  // Store original values for rollback
  const originalIsLiked = optimisticIsLiked.value;
  const originalLikeCount = optimisticLikeCount.value;

  // Optimistic update
  optimisticIsLiked.value = !originalIsLiked;
  optimisticLikeCount.value = originalIsLiked
    ? Math.max(0, originalLikeCount - 1)
    : originalLikeCount + 1;

  // Emit optimistic change immediately
  emits('like-changed', {
    messageId: props.messageId,
    isLiked: optimisticIsLiked.value,
    likeCount: optimisticLikeCount.value,
  });

  loading.value = true;

  try {
    if (originalIsLiked) {
      await services.message.unlikeMessage(props.messageId);
    } else {
      await services.message.likeMessage(props.messageId);
    }
  } catch (error) {
    // Rollback optimistic update on error
    optimisticIsLiked.value = originalIsLiked;
    optimisticLikeCount.value = originalLikeCount;

    // Emit rollback
    emits('like-changed', {
      messageId: props.messageId,
      isLiked: originalIsLiked,
      likeCount: originalLikeCount,
    });

    // Show error toast
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: originalIsLiked
        ? 'Failed to unlike message'
        : 'Failed to like message',
      life: 3000,
    });

    console.error('Like operation failed:', error);
  } finally {
    loading.value = false;
  }
};

const formatLikeCount = (count: number): string => {
  if (count === 0) return '0';
  if (count === 1) return '1';
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Computed values for template
const isLiked = computed(() => optimisticIsLiked.value);
const likeCount = computed(() => optimisticLikeCount.value);
</script>
