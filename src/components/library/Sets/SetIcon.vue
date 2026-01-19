<template>
  <div :class="[
      'w-36 relative rounded-md flex items-center justify-center cursor-pointer transition select-none overflow-hidden border-[color:var(--color-border)]',
      halfSize ? 'h-18' : 'h-36',
      {'border-5': selected }
  ]">
    <div
        class="absolute inset-0 bg-cover bg-center z-0"
        :style="logoBase64 && { backgroundImage : `url(${logoBase64})`}"
    ></div>
    <div class="absolute inset-0 z-1 bg-[color:var(--color-bg)]/50"></div>

    <span :class="['relative z-10 text-sm font-semibold px-2 py-1 text-center rounded title-theme', halfSize ? '' : 'bg-[color:var(--color-bg)]']">
      {{ name }}
    </span>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { getBase64Image } from '@/store'

const props = defineProps({
  name: String,
  logo: String,
  selected: Boolean,
  halfSize: {
    type: Boolean,
    default: false
  }
})

const logoBase64 = ref('')

watch(() => props.logo, async (newLogo) => {
  if (!newLogo) {
    logoBase64.value = ''
    return
  }
  if (newLogo.startsWith('data:')) {
    logoBase64.value = newLogo
    return
  }
  logoBase64.value = await getBase64Image(newLogo)
}, { immediate: true })
</script>