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
        <h2 class="text-2xl font-semibold">{{ $t('options.title') }}</h2>
      </template>
      <template #content>
        <div class="gap-y-4 space-y-6 items-center">
          <div class="grid grid-cols-[minmax(150px,22%)_1fr] items-center">
            <span class="title-theme">{{ $t('options.language') }}</span>
            <div class="flex gap-3">
              <button
                  @click="selectedLanguage = languages.en"
                  :class="[
                    'w-10 h-8 rounded-md transition cursor-pointer flex items-center justify-center text-xl text-theme',
                    selectedLanguage === languages.en
                      ? 'bg-[color:var(--color-list-element)]'
                      : 'hover:bg-[color:var(--color-border)]'
                  ]"
                  title="English">
                🇺🇸
              </button>
              <button
                  @click="selectedLanguage = languages.ru"
                  :class="[
                    'w-10 h-8 rounded-md transition cursor-pointer flex items-center justify-center text-xl text-theme',
                    selectedLanguage === languages.ru
                      ? 'bg-[color:var(--color-list-element)]'
                      : 'hover:bg-[color:var(--color-border)]'
                  ]"
                  title="Русский">
                🇷🇺
              </button>
            </div>
          </div>
          <toggle div-class="grid grid-cols-[minmax(150px,22%)_1fr] items-center" :label="$t('options.darkMode')" v-model:value="isDarkMode" />
          <div class="title-theme mb-2">{{ $t('options.tooltipDelay') }}</div>
          <div class="pl-4 space-y-2">
            <slider :div-class="sliderClass" :label="$t('options.buttonTooltipShow')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.buttonShow" />
            <slider :div-class="sliderClass" :label="$t('options.buttonTooltipHide')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.buttonHide" />
          </div>
          <div class="pl-4 space-y-2">
            <slider :div-class="sliderClass" :label="$t('options.inputTooltipShow')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.infoShow" />
            <slider :div-class="sliderClass" :label="$t('options.inputTooltipHide')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.infoHide" />
          </div>
          <div class="pl-4 space-y-2">
            <slider :div-class="sliderClass" :label="$t('options.jinxTooltipShow')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.jinxesShow" />
            <slider :div-class="sliderClass" :label="$t('options.jinxTooltipHide')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.jinxesHide" />
          </div>
          <div class="title-theme mb-2">{{ $t('options.restoreSets') }}</div>
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
                                 :tooltip="$t('options.restoreThisSet')"
                                 :is-circle-type="false"
                                 button-class="w-9 h-9 bg-[color:var(--color-bg)]"
                                 @click="restoreSet(set)" />
                  <action-button v-else
                                 icon="check"
                                 icon-size="w-6 h-6"
                                 icon-color="fill-emerald-700"
                                 :tooltip="$t('options.setIsInstalled')"
                                 :is-circle-type="false"
                                 :is-disable="true"
                                 button-class="w-9 h-9 bg-[color:var(--color-bg)]" />
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-5">
            <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition border-[color:var(--color-border)] text-theme"
                 @click="isOpenImport = true">
              <span>{{ $t('options.importLibraryData') }}</span>
            </div>
            <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition border-[color:var(--color-border)] text-theme"
                 @click="isOpenExport = true">
              <span>{{ $t('options.exportLibraryData') }}</span>
            </div>
            <import-library v-if="isOpenImport"
                            @on-close="isOpenImport = !isOpenImport" />
            <export-library v-if="isOpenExport"
                            @on-close="isOpenExport = !isOpenExport" />
          </div>
          <div>
            <button
                @click="isVisibleResetAppDataDialog = true"
                class="ml-4 px-4 py-2 rounded-xl whitespace-nowrap text-theme border-[color:var(--color-border)] cursor-pointer text-theme bg-[color:var(--color-button-error)] hover:bg-[color:var(--color-button-hover-error)]"
            >{{ $t('options.resetAppData') }}
            </button>
          </div>
          <confirm-dialog v-if="isVisibleResetAppDataDialog"
                          :title="$t('options.deleteAppData')"
                          :description="$t('options.deleteAppDataDesc')"
                          @confirm="isVisibleResetAppDataDialog = false; isVisibleResetAppDataDialogTwo = true"
                          @cancel="isVisibleResetAppDataDialog = false" />
          <confirm-dialog v-if="isVisibleResetAppDataDialogTwo"
                          :title="$t('options.deleteAppData')"
                          :description="$t('options.deleteAppDataConfirm')"
                          @confirm="resetAppData(); isVisibleResetAppDataDialogTwo = false"
                          @cancel="isVisibleResetAppDataDialogTwo = false" />
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
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";

defineOptions({
  name: 'options'
})

const instance = getCurrentInstance()
const libraryStore = useLibraryStore()
const { metaSets } = storeToRefs(libraryStore)
const craftStore = useCraftStore()
const optionsStore = useOptionsStore()
const indexStore = useIndexStore()
const { theme, themes, tooltipDelay, language, languages } = storeToRefs(optionsStore)
const isCanSave = ref(false)
const selectedLanguage = ref(null)
const isDarkMode = ref(false)
const originalSets = ref(null)
const tooltipDelayOptions = ref()
const isOpenImport = ref(false)
const isOpenExport = ref(false)
const isVisibleResetAppDataDialog = ref(false)
const isVisibleResetAppDataDialogTwo = ref(false)
const emits = defineEmits(['onClose'])
const sliderClass = 'grid grid-cols-[minmax(150px,20%)_25%_4rem] items-center gap-x-4'

function save(){
  try{
    optionsStore.setOptions({
      theme: isDarkMode.value ? themes.value.dark : themes.value.light,
      tooltipDelay: tooltipDelayOptions.value,
      language: selectedLanguage.value
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
    selectedLanguage.value = language.value
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

async function resetAppData(){
  await optionsStore.deleteAppData()
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
watch(language, () => {
  selectedLanguage.value = language.value
}, { immediate: true })
watch(theme, () => {
  isDarkMode.value = themes.value.dark === theme.value
}, { immediate: true })
watch(tooltipDelay, () => {
  tooltipDelayOptions.value = {...tooltipDelay.value }
}, { immediate: true })

function checkCanSave() {
  isCanSave.value = !isEqual(tooltipDelayOptions.value, {...tooltipDelay.value })
      || isDarkMode.value !== (themes.value.dark === theme.value)
      || selectedLanguage.value !== language.value
}
watch(tooltipDelayOptions, checkCanSave, { immediate: true, deep: true })
watch(isDarkMode, checkCanSave, { immediate: true, deep: true })
watch(selectedLanguage, checkCanSave, { immediate: true })
</script>