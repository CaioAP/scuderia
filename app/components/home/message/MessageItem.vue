<template>
  <div
    class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
  >
    <!-- Author Information -->
    <div class="flex items-center gap-3 mb-3">
      <BaseAvatar
        :image="message.author.avatar"
        :label="message.author.label"
        shape="circle"
        class="w-10 h-10"
      />
      <div class="flex-1 min-w-0">
        <h4 class="text-base font-semibold text-gray-700 truncate">
          {{
            message.author.name.trim() ||
            message.author.label.trim() ||
            'Unknown'
          }}
        </h4>
        <p class="text-sm text-gray-500">
          {{ formatTimestamp(message.createdAt) }}
        </p>
      </div>
    </div>

    <!-- Message Content -->
    <div
      class="prose prose-sm max-w-none mb-4 text-base text-gray-600 leading-relaxed"
      v-html="sanitizeHtmlContent(message.content)"
    />

    <!-- Message Actions -->
    <div class="flex justify-end">
      <MessageActions
        :message-id="message.id"
        :like-count="message.likeCount"
        :is-liked="message.isLiked"
        :loading="message.loading"
        @like-changed="handleLikeChanged"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '#shared/types/Message';
import BaseAvatar from '~/components/BaseAvatar.vue';
import MessageActions from './MessageActions.vue';
import { formatTimestamp, sanitizeHtmlContent } from '~/utils/Message';

interface Props {
  message: Message;
}

interface Emits {
  (
    e: 'like-changed',
    data: { messageId: number; isLiked: boolean; likeCount: number },
  ): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const handleLikeChanged = (data: {
  messageId: number;
  isLiked: boolean;
  likeCount: number;
}) => {
  emits('like-changed', data);
};
</script>

<style scoped>
/* Custom prose styles for message content */
.prose {
  color: inherit;
}

.prose p {
  margin-bottom: 0.75rem;
}

.prose p:last-child {
  margin-bottom: 0;
}

.prose strong,
.prose b {
  font-weight: 600;
}

.prose em,
.prose i {
  font-style: italic;
}

.prose u {
  text-decoration: underline;
}

.prose s,
.prose strike {
  text-decoration: line-through;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.prose ul,
.prose ol {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 0.75rem 0;
  font-style: italic;
  color: #6b7280;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
}

.prose a:hover {
  color: #1d4ed8;
}
</style>
