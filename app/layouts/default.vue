<template>
  <TheHeader />

  <main class="w-(--body-width) h-(--body-height) mt-16 ml-16 bg-gray-400">
    <TheAside />

    <slot />
  </main>

  <footer></footer>
</template>

<script lang="ts" setup>
const items = ref([]);
</script>

<style scoped>
main {
  --body-width: calc(100svw - 4rem);
  --body-height: calc(100svh - 4rem);
}
</style>
