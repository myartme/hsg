<template>
  <div :class="[
      'w-36 relative rounded-md flex items-center justify-center cursor-pointer transition select-none overflow-hidden border-[color:var(--color-border)]',
      halfSize ? 'h-18' : 'h-36',
      {'border-5': selected }
  ]">
    <div
        class="absolute inset-0 bg-cover bg-center z-0"
        :style="logo && { backgroundImage : `url(${logo})`}"
    ></div>
    <div class="absolute inset-0 z-1 bg-[color:var(--color-bg)]/50"></div>

    <span :class="['relative z-10 text-sm font-semibold px-2 py-1 text-center rounded title-theme', halfSize ? '' : 'bg-[color:var(--color-bg)]']">
      {{ name }}
    </span>
  </div>
</template>
<script setup>
const props = defineProps({
  name: String,
  logo: String,
  selected: Boolean,
  halfSize: {
    type: Boolean,
    default: false
  }
})
</script>