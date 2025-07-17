<template>
  <div :class="itemClass">
    <button class="pt-5 -mr-5 text-[color:var(--color-text)]">✕</button>
  </div>
</template>
<script setup>
const props = defineProps({
  itemClass: String
})
</script>