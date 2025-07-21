<template>
  <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition border-[color:var(--color-border)] text-[color:var(--color-text)]"
       @click="isOpen = true">
    <span>{{ title }}</span>
  </div>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="isOpen = !isOpen; messages = []">
    <template #header>
      <div class="flex">
        <p class="title-theme mr-2">{{ title }}</p>
        <info-tooltip class="mt-1" icon-size="w-5 h-5" text="<strong>Merge mode:</strong><br>New sets are added to your library. New characters are added to existing sets. New options are added.<br><br><strong>Replace mode:</strong><br>Includes merge mode. All existing items in your library will be replaced with the imported ones." />
      </div>
    </template>
    <template #content>
      <div class="relative">
        <div class="grid grid-cols-[1fr_1fr] justify-items-center items-center gap-4">
          <drag-and-drop
              class="w-[80%]"
              :text="`${inputPlaceholder}<br><strong>Merge mode</strong>`"
              @json-loaded="loadedContentWithMerge" />
          <drag-and-drop
              class="w-[80%]"
              :text="`${inputPlaceholder}<br><strong>Replace mode</strong>`"
              @json-loaded="loadedContentWithReplace" />
        </div>
        <div v-if="messages.length > 0"
             class="absolute top-0 left-0 w-full h-full bg-[color:var(--color-bg)] text-[color:var(--color-text)] z-10 flex flex-col items-center justify-center px-4 text-center">
          <p v-for="message in messages" :key="message" class="mb-2 text-lg">
            {{ message }}
          </p>
        </div>
      </div>
    </template>
  </popup-container>
</template>
<script setup>
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
import DragAndDrop from "@/components/ui/DragAndDrop.vue";
import PopupContainer from "@/components/PopupContainer.vue";
import {ref} from "vue";
import {useOptionsStore} from "@/store/options";

const props = defineProps({
  title: String
})
const optionsStore = useOptionsStore()
const isOpen = ref(false)
const messages = ref([])
const inputPlaceholder = "Click to choose a JSON file / drag a JSON file here"
function loadedContentWithMerge(value){
  textareaValueChange({ text: value, withReplace: false })
}

function loadedContentWithReplace(value){
  textareaValueChange({ text: value, withReplace: true })
}

function textareaValueChange({ text, withReplace }){
  try{
    const jsonContent = JSON.parse(text)
    formalizedList(jsonContent, withReplace)
  } catch (e){
    formalizedList({})
  }
}

function formalizedList(content, withReplace){
  if(content.sets){
    let isOk = optionsStore.importSets(content.sets, withReplace)
    messages.value.push(isOk ? 'Sets imported.' : 'An error occurred while importing the sets.')
  }
  if(content.scripts){
    let isOk = optionsStore.importScripts(content.scripts, withReplace)
    messages.value.push(isOk ? 'Scripts imported.' : 'An error occurred while importing the scripts.')
  }
  if(content.options){
    let isOk = optionsStore.importOptions(content.options, withReplace)
    messages.value.push(isOk ? 'Options imported.' : 'An error occurred while importing the options.')
  }
}
</script>