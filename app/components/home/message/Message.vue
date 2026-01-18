<template>
  <div class="px-4 pt-2 pb-4">
    <div>
      <h2 class="text-lg text-gray-700">O que você está pensando hoje? 🤔</h2>
      <p class="text-sm text-gray-500">
        Compartilhe com seus colegas uma frase, um sentimento ou algo
        interessante.
      </p>
    </div>

    <HomeMessageForm
      class="mt-4"
      @message-created="handleMessageCreated"
    />
  </div>
</template>

<script setup lang="ts">
// Define emits for parent communication
const emit = defineEmits<{
  messageCreated: [message: any];
}>();

const handleMessageCreated = (message: any) => {
  // Pass the event up to the parent component
  emit('messageCreated', message);
};
</script>
