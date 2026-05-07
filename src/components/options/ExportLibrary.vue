<template>
  <popup-container
      :is-input-visible="false"
      @close="$emit('onClose')">
    <template #header>
      <p class="title-theme mr-2">{{ $t('importExport.exportLibraryData') }}</p>
    </template>
    <template #content>
      <div class="grid grid-cols-[1fr_1fr_1fr]">
        <export-step v-if="steps.includes('categories')"
                     :title="$t('importExport.selectCategories')"
                     :value="categories"
                     :inputs="categoryInputs"
                     @on-update-items="updateCategories" />
        <export-step v-if="steps.includes('sets')"
                     :title="$t('importExport.selectSets')"
                     :value="sets"
                     :inputs="setInputs"
                     @on-update-items="updateSets" />
        <export-step v-if="steps.includes('scripts')"
                     :title="$t('importExport.selectScripts')"
                     :value="scripts"
                     :inputs="scriptInputs"
                     @on-update-items="updateScripts" />
      </div>
      <div :class="[
          'border-2 mt-4 border-dashed rounded-md text-center relative border-[color:var(--color-border)]',
          isCanExport
            ? 'hover:border-[color:var(--color-active)] cursor-pointer'
            : 'bg-[color:var(--color-disable-placeholder-text)] cursor-not-allowed'
          ]" @click="exportData()">
          <template v-if="isCanExport">
            <p class="text-[color:var(--color-placeholder-text)]">{{ $t('importExport.clickToExport') }}</p>
          </template>
          <template v-else>
            <p v-for="msg in missingSelections" :key="msg" class="text-[color:var(--color-bg)]">{{ msg }}</p>
          </template>
          <p :class="['align-text-bottom', isCanExport ? 'text-[color:var(--color-placeholder-text)]' : 'text-[color:var(--color-bg)]']" v-html="getExportDescription()"></p>
      </div>
    </template>
    <spinner v-if="isWaitingOperation"
             item-class="fixed inset-0 z-50 bg-black/60 pointer-events-auto flex justify-center items-center" size="w-20 h-20" />
  </popup-container>
</template>
<script setup>
import PopupContainer from "@/components/PopupContainer.vue";
import {computed, ref} from "vue";
import {useLibraryStore} from "@/store/library";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import {toNormalizeString} from "@/constants/other";
import ExportStep from "@/components/options/ExportStep.vue";
import {useOptionsStore} from "@/store/options";
import Spinner from "@/components/ui/Spinner.vue";

const { t } = useI18n()
const libraryStore = useLibraryStore()
const craftStore = useCraftStore()
const optionsStore = useOptionsStore()
const { metaSets } = storeToRefs(libraryStore)
const { scriptList, isWaitingOperation } = storeToRefs(craftStore)
const steps = ref(['categories'])
const categories = ref([])
const sets = ref([])
const scripts = ref([])

const isCanExport = computed(() =>
    !steps.value.some(el => {
    if (el === 'categories') return categories.value.length <= 0
    if (el === 'sets') return sets.value.length <= 0
    if (el === 'scripts') return scripts.value.length <= 0
    })
)

const missingSelections = computed(() => {
  const missing = []
  if (categories.value.length === 0) {
    missing.push(t('importExport.selectCategories'))
  }
  if (steps.value.includes('sets') && sets.value.length === 0) {
    missing.push(t('importExport.selectSets'))
  }
  if (steps.value.includes('scripts') && scripts.value.length === 0) {
    missing.push(t('importExport.selectScripts'))
  }
  return missing
})

const categoryInputs = computed(() => ({
  sets: t('importExport.sets'),
  scripts: t('importExport.scripts'),
  scriptTags: t('importExport.scriptTagsCategory'),
  options: t('importExport.optionsCategory')
}))

const setInputs = computed(() => {
  const result = {}
  for(const meta of metaSets.value){
    result[meta.id] = meta.name
  }

  return result
})

const scriptInputs = computed(() => {
  const result = {}
  for(const script of scriptList.value){
    const key = toNormalizeString(script.name)
    result[key] = script.name
  }

  return result
})

function updateCategories(event){
  categories.value = event
  steps.value = ['categories', ...event]
}

function updateSets(event){
  sets.value = event
}

function updateScripts(event){
  scripts.value = event
}

function getExportDescription(){
  let text = ''
  const setLength = sets.value.length
  const scriptLength = scripts.value.length
  steps.value.forEach(el => {
    if(el === 'sets' && setLength > 0){
      text += '<br>' + t('importExport.sets') + ': ' + setLength
    }
    if(el === 'scripts' && scriptLength > 0){
      text += '<br>' + t('importExport.scripts') + ': ' + scriptLength
    }
    if(el === 'scriptTags'){
      text += '<br>' + t('importExport.scriptTagsCategory')
    }
    if(el === 'options'){
      text += '<br>' + t('importExport.optionsCategory')
    }
  })

  return text
}

async function exportData(){
  if(!isCanExport.value) return
  isWaitingOperation.value = true
  try {
    let data = {}
    steps.value.forEach(el => {
      if(el === 'sets' && sets.value.length > 0){
        data[el] = sets.value
      }
      if(el === 'scripts' && scripts.value.length > 0){
        data[el] = scripts.value
      }
      if(el === 'options' || el === 'scriptTags'){
        data[el] = true
      }
    })

    const result = await optionsStore.exportData(data)
    const blob = new Blob([result], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `BoTC_HSG_export_${(new Date()).toISOString()}.hsgl`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    isWaitingOperation.value = false
    return true
  } catch(e) {
    isWaitingOperation.value = false
    return false
  }
}
</script>