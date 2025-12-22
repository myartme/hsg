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

  // Локальные изображения и data URL не кешируем
  if (url.startsWith('data:') || url.startsWith('images/') || url.startsWith('/')) {
    imageSrc.value = url
    return
  }

  // Кешируем только валидные http/https URL
  if (url.startsWith('https://') || url.startsWith('http://')) {
    imageSrc.value = url // показываем URL пока загружается
    imageSrc.value = await getBase64Image(url)
  } else {
    // Невалидный URL - просто показываем как есть
    imageSrc.value = url
  }
}

watch(() => props.src, (newUrl) => {
  loadImage(newUrl)
}, { immediate: true })
</script>
