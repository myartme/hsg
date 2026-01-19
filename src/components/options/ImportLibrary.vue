<template>
  <popup-container
      :is-input-visible="false"
      @close="$emit('onClose'); messages = []">
    <template #header>
      <div class="flex">
        <p class="title-theme mr-2">{{ $t('importExport.importLibraryData') }}</p>
        <info-tooltip class="mt-1" icon-size="w-5 h-5" :text="$t('importExport.importMergeInfo')" />
      </div>
    </template>
    <template #content>
      <div class="relative">
        <div class="grid grid-cols-[1fr_1fr] justify-items-center items-center gap-4">
          <drag-and-drop
              class="w-[80%]"
              :text="`${$t('importExport.dragDropHsgl')}<br><strong>${$t('importExport.mergeMode')}</strong>`"
              :formats="['hsgl']"
              @json-loaded="loadedContentWithMerge" />
          <drag-and-drop
              class="w-[80%]"
              :text="`${$t('importExport.dragDropHsgl')}<br><strong>${$t('importExport.replaceMode')}</strong>`"
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
import {useI18n} from "vue-i18n";

const { t } = useI18n()
const props = defineProps({
  title: String
})
const optionsStore = useOptionsStore()
const messages = ref([])
const emits = defineEmits(['onClose'])

function loadedContentWithMerge(value){
  textareaValueChange({ text: value, withReplace: false })
}

function loadedContentWithReplace(value){
  textareaValueChange({ text: value, withReplace: true })
}

function textareaValueChange({ text, withReplace }){
  console.log('=== textareaValueChange ===', { withReplace, textLength: text?.length })
  try{
    const jsonContent = JSON.parse(text)
    console.log('Parsed JSON keys:', Object.keys(jsonContent))
    formalizedList(jsonContent, withReplace)
  } catch (e){
    console.error('JSON parse error:', e)
    formalizedList({})
  }
}

async function formalizedList(content, withReplace){
  if(content.sets){
    let isOk = await optionsStore.importSets(content.sets, withReplace)
    messages.value.push(isOk ? t('importExport.setsImported') : t('importExport.errorImportingSets'))
  }
  if(content.scripts){
    let isOk = await optionsStore.importScripts(content.scripts, withReplace)
    messages.value.push(isOk ? t('importExport.scriptsImported') : t('importExport.errorImportingScripts'))
  }
  if(content.scriptTags){
    let isOk = await optionsStore.importScriptTags(content.scriptTags, withReplace)
    messages.value.push(isOk ? t('importExport.scriptTagsImported') : t('importExport.errorImportingScriptTags'))
  }
  if(content.options){
    let isOk = await optionsStore.importOptions(content.options)
    messages.value.push(isOk ? t('importExport.optionsImported') : t('importExport.errorImportingOptions'))
  }
}
</script>