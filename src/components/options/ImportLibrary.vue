<template>
  <popup-container
      :is-input-visible="false"
      @close="$emit('onClose'); messages = []">
    <template #header>
      <div class="flex">
        <p class="title-theme mr-2">Import library data</p>
        <info-tooltip class="mt-1" icon-size="w-5 h-5" text="<strong>Merge mode:</strong><br> - New sets are added to your library <br> - New characters are added to existing sets<br> - New scripts are added to your script list<br> - New script versions are added to your script list<br> - New options are added<br><br><strong>Replace mode:</strong><br> - Includes merge mode <br> - Existing characters in sets are replaced<br> - Existing versions in scripts are replaced" />
      </div>
    </template>
    <template #content>
      <div class="relative">
        <div class="grid grid-cols-[1fr_1fr] justify-items-center items-center gap-4">
          <drag-and-drop
              class="w-[80%]"
              :text="`${inputPlaceholder}<br><strong>Merge mode</strong>`"
              :formats="['hsgl']"
              @json-loaded="loadedContentWithMerge" />
          <drag-and-drop
              class="w-[80%]"
              :text="`${inputPlaceholder}<br><strong>Replace mode</strong>`"
              :formats="['hsgl']"
              @json-loaded="loadedContentWithReplace" />
        </div>
        <div v-if="messages.length > 0"
             class="absolute top-0 left-0 w-full h-full bg-[color:var(--color-bg)] text-theme z-10 flex flex-col items-center justify-center px-4 text-center">
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
const messages = ref([])
const emits = defineEmits(['onClose'])
const inputPlaceholder = "Click to choose a HSGL file / drag a HSGL file here"
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

async function formalizedList(content, withReplace){
  if(content.sets){
    let isOk = await optionsStore.importSets(content.sets, withReplace)
    messages.value.push(isOk ? 'Sets imported.' : 'An error occurred while importing the sets.')
  }
  if(content.scripts){
    let isOk = await optionsStore.importScripts(content.scripts, withReplace)
    messages.value.push(isOk ? 'Scripts imported.' : 'An error occurred while importing the scripts.')
  }
  if(content.scriptTags){
    let isOk = await optionsStore.importScriptTags(content.scriptTags, withReplace)
    messages.value.push(isOk ? 'Script tags imported.' : 'An error occurred while importing the script tags.')
  }
  if(content.options){
    let isOk = await optionsStore.importOptions(content.options)
    messages.value.push(isOk ? 'Options imported.' : 'An error occurred while importing the options.')
  }
}
</script>