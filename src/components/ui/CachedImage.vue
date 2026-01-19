<template>
  <img :src="imageSrc" :class="imgClass" :alt="alt" />
</template>
<script setup>
import { ref, watch } from 'vue'
import { getBase64Image } from '@/store'

const props = defineProps({
  src: String,
  imgClass: String,
  alt: {
    type: String,
    default: ''
  }
})

const imageSrc = ref('')

async function loadImage(url) {
  if (!url) {
    imageSrc.value = ''
    return
  }

  // Если уже data URL - используем как есть
  if (url.startsWith('data:')) {
    imageSrc.value = url
    return
  }

  // Для всех остальных путей (локальные и http) используем getBase64Image
  imageSrc.value = await getBase64Image(url)
}

watch(() => props.src, (newUrl) => {
  loadImage(newUrl)
}, { immediate: true })
</script>
