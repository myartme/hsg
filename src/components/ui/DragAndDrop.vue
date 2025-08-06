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
        accept=".json"
        class="hidden"
        @change="onFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: String
})

const fileInput = ref(null)
const error = ref("")
const isDragging = ref(false)
const emit = defineEmits(['jsonLoaded'])
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFile(file) {
  if (!file){
    error.value = "The file was not received. Please try again."
    return
  }

  if (file.type === 'application/json' || file.name.endsWith('.json')) {
    const reader = new FileReader()

    reader.onload = () => {
      emit('jsonLoaded', reader.result)
    }

    reader.onerror = () => {
      error.value = "An error occurred while reading the file. Please ensure it meets the requirements and try again."
    }

    reader.readAsText(file)
  } else {
    error.value = `Invalid file format ${file.type}. Please ensure it meets the requirements and try again.`
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