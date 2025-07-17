<template>
  <div :class="itemClass">
    <svg :class="`h-${size} w-${size} animate-spin`" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <circle
          cx="25"
          cy="25"
          r="15"
          fill="none"
          style="stroke: var(--color-text);"
          stroke-width="10"
      />
      <circle
          cx="25"
          cy="25"
          r="15"
          fill="none"
          style="stroke: var(--color-active);"
          stroke-width="7"
          stroke-linecap="round"
          stroke-dasharray="31.4 94.2"
          stroke-dashoffset="0"
      />
    </svg>
  </div>
</template>
<script setup>
const props = defineProps({
  itemClass: String,
  size: {
    type: [Number, String],
    default: 8
  }
})
</script>
