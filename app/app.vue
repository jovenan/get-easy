<script setup lang="ts">
const { $colorMode } = useNuxtApp();
if ($colorMode) {
  $colorMode.preference = 'light';
}
</script>
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
