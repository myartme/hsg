<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden">
    <sector-container :name="instance?.type.name" :is-show-sticky="isCanSave" header-class="flex items-center gap-2 p-5">
      <template #sticky>
        <action-button
            icon="save"
            icon-size="w-6 h-6"
            button-class="w-10 h-10"
            :handle="save" />
        <action-button
            icon="undo"
            icon-size="w-7 h-7"
            button-class="w-10 h-10"
            :handle="undo" />
      </template>
      <template #header>
        <h2 class="text-2xl font-semibold">Options</h2>
      </template>
      <template #content>
        <div class="gap-y-4 space-y-6 items-center">
          <toggle div-class="grid grid-cols-[minmax(150px,22%)_1fr] items-center" label="Dark mode" v-model:value="isDarkMode" />
          <div class="title-theme mb-2">Tooltip delay</div>
          <div class="pl-4 space-y-2">
            <slider :div-class="sliderClass" label="Button tooltip show" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.buttonShow" />
            <slider :div-class="sliderClass" label="Button tooltip hide" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.buttonHide" />
          </div>
          <div class="pl-4 space-y-2">
            <slider :div-class="sliderClass" label="Input tooltip show" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.infoShow" />
            <slider :div-class="sliderClass" label="Input tooltip hide" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.infoHide" />
          </div>
          <div class="pl-4 space-y-2">
            <slider :div-class="sliderClass" label="Jinx select character tooltip show" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.jinxesShow" />
            <slider :div-class="sliderClass" label="Jinx select character tooltip hide" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.jinxesHide" />
          </div>
          <div class="flex gap-5">
            <div v-for="set in originalSets" class="w-36 h-36 relative rounded-md flex items-center justify-center cursor-pointer transition select-none overflow-hidden border-[color:var(--color-border)]">
              <div class="absolute inset-0 bg-cover bg-center z-0"
                   :style="`background-image: url(${set.logo})`"></div>
              <div class="relative w-full h-full rounded-md overflow-hidden">
                <span class="absolute inset-0 flex items-center justify-center text-sm font-semibold z-10 px-2 text-center rounded-md title-theme bg-[color:var(--color-bg)]/50">
                  {{ set.name }}
                </span>
                <div class="absolute bottom-1.5 right-1.5 z-20 p-1.5 transition">
                  <action-button v-if="isEnableButton(set.id)"
                                 icon="undo"
                                 icon-size="w-7 h-7"
                                 tooltip="Restore this set"
                                 :is-circle-type="false"
                                 button-class="w-9 h-9 bg-[color:var(--color-bg)]"
                                 @click="restoreSet(set)" />
                  <action-button v-else
                                 icon="check"
                                 icon-size="w-6 h-6"
                                 icon-color="fill-emerald-700"
                                 tooltip="Set is installed"
                                 :is-circle-type="false"
                                 :is-disable="true"
                                 button-class="w-9 h-9 bg-[color:var(--color-bg)]" />
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-5">
            <import-library title="Import library data" />
            <export-library title="Export library data" />
          </div>
        </div>
      </template>
    </sector-container>
  </div>
</template>
<script setup>
import SectorContainer from "@/components/SectorContainer.vue";
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME} from "@/constants/other";
import Toggle from "@/components/ui/Toggle.vue";
import {useOptionsStore} from "@/store/options";
import {storeToRefs} from "pinia";
import Slider from "@/components/ui/Slider.vue";
import {useIndexStore} from "@/store";
import {isEqual} from "lodash/lang";
import ImportLibrary from "@/components/options/ImportLibrary.vue";
import ExportLibrary from "@/components/options/ExportLibrary.vue";
import {useLibraryStore} from "@/store/library";
import {useCraftStore} from "@/store/craft";

defineOptions({
  name: 'options'
})

const instance = getCurrentInstance()
const libraryStore = useLibraryStore()
const { metaSets } = storeToRefs(libraryStore)
const craftStore = useCraftStore()
const optionsStore = useOptionsStore()
const indexStore = useIndexStore()
const { theme, themes, tooltipDelay } = storeToRefs(optionsStore)
const isCanSave = ref(false)
const isDarkMode = ref(false)
const originalSets = ref(null)
const tooltipDelayOptions = ref()
const sliderClass = 'grid grid-cols-[minmax(150px,20%)_25%_4rem] items-center gap-x-4'

function save(){
  try{
    optionsStore.setOptions({
      theme: isDarkMode.value ? themes.value.dark : themes.value.light,
      tooltipDelay: tooltipDelayOptions.value
    })
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

function undo(){
  try{
    isDarkMode.value = (themes.value.dark === theme.value)
    tooltipDelayOptions.value = {...tooltipDelay.value }
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

function isEnableButton(setId){
  return !metaSets.value.find(el => el.id === setId)
}

async function restoreSet(setId){
  await libraryStore.restoreSet(setId)
}

onMounted(async () => {
  await libraryStore.loadSets()
  await craftStore.loadScripts()
  originalSets.value = await libraryStore.getOriginalSets()
  originalSets.value = originalSets.value.filter(el => !el.isOfficial)
})

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
watch(theme, () => {
  isDarkMode.value = themes.value.dark === theme.value
}, { immediate: true })
watch(tooltipDelay, () => {
  tooltipDelayOptions.value = {...tooltipDelay.value }
}, { immediate: true })
watch(tooltipDelayOptions, () => {
  isCanSave.value = !isEqual(tooltipDelayOptions.value, {...tooltipDelay.value }) || isDarkMode.value !== (themes.value.dark === theme.value)
}, { immediate: true, deep: true })
watch(isDarkMode, () => {
  isCanSave.value = !isEqual(tooltipDelayOptions.value, {...tooltipDelay.value }) || isDarkMode.value !== (themes.value.dark === theme.value)
}, { immediate: true, deep: true })
</script>