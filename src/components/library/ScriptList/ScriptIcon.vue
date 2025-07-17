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

    <div class="relative w-full h-full rounded-md overflow-hidden">
      <span class="absolute inset-0 flex items-center justify-center text-sm font-semibold z-10 px-2 text-center rounded-md title-theme bg-[color:var(--color-bg)]">
        {{ name }}
      </span>
    </div>
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