<template>
  <div :class="itemClass">
    <button class="pt-5 -mr-5 text-theme">✕</button>
  </div>
</template>
<script setup>
const props = defineProps({
  itemClass: String
})
</script>