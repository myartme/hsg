<template>
  <div
      :class="[
          'border-2 border-dashed rounded-md p-6 text-center cursor-pointer relative',
          isDragging ? 'border-[color:var(--color-active)] bg-[color:var(--color-hover-active)]' : 'border-[color:var(--color-border)]'
      ]"
      @click="triggerFileInput"
      @dragover.prevent
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
  >
    <div class="pointer-events-none">
      <p class="text-[color:var(--color-placeholder-text)]" v-html="text"></p>
      <p class="align-text-bottom text-[color:var( --color-error)]" v-html="error"></p>
    </div>
    <input
        ref="fileInput"
        type="file"
        :accept="getFormats"
        class="hidden"
        @change="onFileChange"
    />
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {useI18n} from "vue-i18n";

const { t } = useI18n()
const props = defineProps({
  text: String,
  formats: {
    type: Array,
    default: ['json']
  }
})

const fileInput = ref(null)
const error = ref("")
const isDragging = ref(false)
const emit = defineEmits(['jsonLoaded'])
const getFormats = computed(() => {
  return props.formats.map(el => '.' + el).join(',')
})
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFile(file) {
  if (!file){
    error.value = t('errors.fileNotReceived')
    return
  }

  if (file.type === 'application/json' || file.name.endsWith('.hsgl')) {
    const reader = new FileReader()

    reader.onload = () => {
      emit('jsonLoaded', reader.result)
    }

    reader.onerror = () => {
      error.value = t('errors.fileReadError')
    }

    reader.readAsText(file)
  } else {
    error.value = t('errors.invalidFileFormat', { format: file.type })
  }
}

function onFileChange(event) {
  const file = event.target.files[0]
  handleFile(file)
}

function onDrop(event) {
  const file = event.dataTransfer.files[0]
  isDragging.value = false
  handleFile(file)
}
</script>