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
      v-html="sanitizeContent(message.content)"
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

// Timestamp formatting utility
const formatTimestamp = (date: Date): string => {
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? 'just now' : `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? '1 minute ago'
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  // Ensure we don't return "0 years ago" - if we're here, it should be at least 1 year
  const years = Math.max(1, diffInYears);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

// HTML sanitization utility
const sanitizeContent = (content: string): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Define allowed tags and attributes for rich text content
  const allowedTags = [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'strike',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'span',
    'div',
  ];

  const allowedAttributes = ['href', 'target', 'class', 'style'];

  // Remove script tags and other dangerous elements
  const scripts = tempDiv.querySelectorAll(
    'script, object, embed, iframe, form, input, button',
  );
  scripts.forEach((script) => script.remove());

  // Remove dangerous attributes
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach((element) => {
    // Remove elements not in allowed list
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.replaceWith(...element.childNodes);
      return;
    }

    // Remove dangerous attributes
    Array.from(element.attributes).forEach((attr) => {
      if (
        !allowedAttributes.includes(attr.name.toLowerCase()) &&
        !attr.name.startsWith('data-')
      ) {
        element.removeAttribute(attr.name);
      }
    });

    // Sanitize href attributes
    if (element.tagName.toLowerCase() === 'a') {
      const href = element.getAttribute('href');
      if (href && !href.match(/^(https?:\/\/|mailto:|tel:)/)) {
        element.removeAttribute('href');
      }
    }
  });

  return tempDiv.innerHTML;
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
