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
            icon="revert"
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
          <div class="border rounded-md border-[color:var(--color-border)]">
            <div
                class="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-[color:var(--color-hover-bg)] rounded-md"
                @click="isTooltipDelayOpen = !isTooltipDelayOpen"
            >
              <span class="title-theme">{{ $t('options.tooltipDelay') }}</span>
              <svg
                  :class="['w-5 h-5 transition-transform duration-200 text-theme', isTooltipDelayOpen ? 'rotate-180' : '']"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <transition name="collapse">
              <div v-show="isTooltipDelayOpen" class="px-4 pt-2.5 pb-4 space-y-4">
                <div class="space-y-2">
                  <slider :div-class="sliderClass" :label="$t('options.buttonTooltipShow')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.buttonShow" />
                  <slider :div-class="sliderClass" :label="$t('options.buttonTooltipHide')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.buttonHide" />
                </div>
                <div class="space-y-2">
                  <slider :div-class="sliderClass" :label="$t('options.inputTooltipShow')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.infoShow" />
                  <slider :div-class="sliderClass" :label="$t('options.inputTooltipHide')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.infoHide" />
                </div>
                <div class="space-y-2">
                  <slider :div-class="sliderClass" :label="$t('options.jinxTooltipShow')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.jinxesShow" />
                  <slider :div-class="sliderClass" :label="$t('options.jinxTooltipHide')" :min="0" :max="5000" :step="50" v-model:value="tooltipDelayOptions.jinxesHide" />
                </div>
              </div>
            </transition>
          </div>
          <div class="border rounded-md border-[color:var(--color-border)]">
            <div
                class="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-[color:var(--color-hover-bg)] rounded-md"
                @click="isScriptEditorDefaultsOpen = !isScriptEditorDefaultsOpen"
            >
              <span class="title-theme">{{ $t('options.scriptEditorDefaults') }}</span>
              <svg
                  :class="['w-5 h-5 transition-transform duration-200 text-theme', isScriptEditorDefaultsOpen ? 'rotate-180' : '']"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <transition name="collapse">
              <div v-show="isScriptEditorDefaultsOpen" class="px-4 pt-2.5 pb-4">
                <span class="text-theme text-sm mb-2 block">{{ $t('options.setsFilter') }}</span>
                <label class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
                  <input type="checkbox" value="official_trouble_brewing" class="cursor-pointer" v-model="selectedDefaultFilters">
                  <span class="text-theme">Trouble Brewing</span>
                </label>
                <label class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
                  <input type="checkbox" value="official_sects_and_violets" class="cursor-pointer" v-model="selectedDefaultFilters">
                  <span class="text-theme">Sects & Violets</span>
                </label>
                <label class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
                  <input type="checkbox" value="official_bad_moon_rising" class="cursor-pointer" v-model="selectedDefaultFilters">
                  <span class="text-theme">Bad Moon Rising</span>
                </label>
                <label class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
                  <input type="checkbox" value="official_experimental" class="cursor-pointer" v-model="selectedDefaultFilters">
                  <span class="text-theme">Official Experimental</span>
                </label>
                <label class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
                  <input type="checkbox" value="official_fabled" class="cursor-pointer" v-model="selectedDefaultFilters">
                  <span class="text-theme">Official Fabled</span>
                </label>
                <label class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
                  <input type="checkbox" value="official_loric" class="cursor-pointer" v-model="selectedDefaultFilters">
                  <span class="text-theme">Official Lorics</span>
                </label>
                <template v-for="meta in metaSets">
                  <label v-if="meta.name !== 'BotC official roles'" class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
                    <input type="checkbox" class="cursor-pointer" :value="meta.id" v-model="selectedDefaultFilters">
                    <span class="text-theme">{{ meta.name }}</span>
                  </label>
                </template>
                <div class="flex items-center gap-4 pt-2">
                  <button @click="selectAllFilters" class="px-4 py-1 rounded-md cursor-pointer text-theme bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]">
                    {{ $t('buttons.checkAll') }}
                  </button>
                  <button @click="unselectAllFilters" class="px-4 py-1 rounded-md cursor-pointer text-theme bg-[color:var(--color-placeholder-text)] hover:bg-[color:var(--color-hover-bg)]">
                    {{ $t('buttons.uncheckAll') }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
          <div class="border rounded-md border-[color:var(--color-border)]">
            <div
                class="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-[color:var(--color-hover-bg)] rounded-md"
                @click="isRestoreSetsOpen = !isRestoreSetsOpen"
            >
              <span class="title-theme">{{ $t('options.restoreSets') }}</span>
              <svg
                  :class="['w-5 h-5 transition-transform duration-200 text-theme', isRestoreSetsOpen ? 'rotate-180' : '']"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <transition name="collapse">
              <div v-show="isRestoreSetsOpen" class="px-4 pt-2.5 pb-4">
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
                                       icon="revert"
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
                                       button-class="w-9 h-9 bg-[color:var(--color-bg)]"
                                       @click="deleteSet(set)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <div class="border rounded-md border-[color:var(--color-border)]">
            <div
                class="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-[color:var(--color-hover-bg)] rounded-md"
                @click="isDataManagementOpen = !isDataManagementOpen"
            >
              <span class="title-theme">{{ $t('options.dataManagement') }}</span>
              <svg
                  :class="['w-5 h-5 transition-transform duration-200 text-theme', isDataManagementOpen ? 'rotate-180' : '']"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <transition name="collapse">
              <div v-show="isDataManagementOpen" class="px-4 pt-2.5 pb-4 space-y-4">
                <div class="flex gap-5">
                  <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition border-[color:var(--color-border)] text-theme hover:bg-[color:var(--color-hover-bg)]"
                       @click="isOpenImport = true">
                    <icon-element name="import" size="w-5 h-5" color="fill-[color:var(--color-text)]" />
                    <span>{{ $t('options.importLibraryData') }}</span>
                  </div>
                  <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition border-[color:var(--color-border)] text-theme hover:bg-[color:var(--color-hover-bg)]"
                       @click="isOpenExport = true">
                    <icon-element name="export" size="w-5 h-5" color="fill-[color:var(--color-text)]" />
                    <span>{{ $t('options.exportLibraryData') }}</span>
                  </div>
                </div>
                <div class="grid grid-cols-[minmax(150px,22%)_1fr] items-center">
                  <span class="text-theme">{{ $t('options.imageCache') }}</span>
                  <div class="flex items-center gap-4">
                    <span class="text-theme text-sm">
                      {{ $t('options.imageCacheInfo', { count: imageCacheInfo.count, size: imageCacheInfo.sizeFormatted }) }}
                    </span>
                    <button
                        @click="handleClearImageCache"
                        class="px-3 py-1 rounded-md text-sm cursor-pointer text-theme border border-[color:var(--color-border)] hover:bg-[color:var(--color-hover-bg)]"
                    >{{ $t('options.clearImageCache') }}</button>
                  </div>
                </div>
                <div>
                  <button
                      @click="isVisibleResetAppDataDialog = true"
                      class="px-4 py-2 rounded-xl whitespace-nowrap text-theme border-[color:var(--color-border)] cursor-pointer bg-[color:var(--color-button-error)] hover:bg-[color:var(--color-button-hover-error)]"
                  >{{ $t('options.resetAppData') }}</button>
                </div>
              </div>
            </transition>
            <import-library v-if="isOpenImport"
                            @on-close="isOpenImport = !isOpenImport" />
            <export-library v-if="isOpenExport"
                            @on-close="isOpenExport = !isOpenExport" />
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
import {computed, getCurrentInstance, onMounted, ref, watch} from "vue";
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
import IconElement from "@/components/ui/IconElement.vue";
import {clearImageCache, getImageCacheInfo} from "@/store";

defineOptions({
  name: 'options'
})

const instance = getCurrentInstance()
const libraryStore = useLibraryStore()
const { metaSets } = storeToRefs(libraryStore)
const craftStore = useCraftStore()
const optionsStore = useOptionsStore()
const indexStore = useIndexStore()
const { theme, themes, tooltipDelay, language, languages, scriptEditorDefaultFilters } = storeToRefs(optionsStore)
const isCanSave = ref(false)
const selectedLanguage = ref(null)
const isDarkMode = ref(false)
const originalSets = ref(null)
const tooltipDelayOptions = ref()
const selectedDefaultFilters = ref([])
const isOpenImport = ref(false)
const isOpenExport = ref(false)
const isVisibleResetAppDataDialog = ref(false)
const isVisibleResetAppDataDialogTwo = ref(false)
const imageCacheInfo = ref({ count: 0, sizeFormatted: '0 B' })
const isTooltipDelayOpen = ref(false)
const isScriptEditorDefaultsOpen = ref(false)
const isRestoreSetsOpen = ref(false)
const isDataManagementOpen = ref(false)
const emits = defineEmits(['onClose'])
const sliderClass = 'grid grid-cols-[minmax(150px,20%)_25%_4rem] items-center gap-x-4'

function save(){
  try{
    optionsStore.setOptions({
      theme: isDarkMode.value ? themes.value.dark : themes.value.light,
      tooltipDelay: tooltipDelayOptions.value,
      language: selectedLanguage.value,
      scriptEditorDefaultFilters: selectedDefaultFilters.value
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
    selectedDefaultFilters.value = scriptEditorDefaultFilters.value?.length > 0
        ? [...scriptEditorDefaultFilters.value]
        : [...allFilterItems.value]
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

const allFilterItems = computed(() => {
  const result = [
    'official_trouble_brewing',
    'official_sects_and_violets',
    'official_bad_moon_rising',
    'official_experimental',
    'official_fabled',
    'official_loric'
  ]
  for(const meta of metaSets.value){
    if(meta.name !== 'BotC official roles'){
      result.push(meta.id)
    }
  }
  return result
})

function selectAllFilters(){
  selectedDefaultFilters.value = [...allFilterItems.value]
}

function unselectAllFilters(){
  selectedDefaultFilters.value = []
}

function isEnableButton(setId){
  return !metaSets.value.find(el => el.id === setId)
}

async function restoreSet(setId){
  await libraryStore.restoreSet(setId)
}

async function deleteSet(set){
  await libraryStore.deleteSet(set.id)
}

async function resetAppData(){
  await optionsStore.deleteAppData()
}

async function loadImageCacheInfo() {
  try {
    imageCacheInfo.value = await getImageCacheInfo()
  } catch (e) {
    console.warn('Image cache info not available:', e.message)
  }
}

async function handleClearImageCache() {
  await clearImageCache()
  await loadImageCacheInfo()
}

onMounted(async () => {
  await libraryStore.loadSets()
  await craftStore.loadScripts()
  originalSets.value = await libraryStore.getOriginalSets()
  originalSets.value = originalSets.value.filter(el => !el.isOfficial)
  await loadImageCacheInfo()
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
watch([scriptEditorDefaultFilters, allFilterItems], () => {
  if(scriptEditorDefaultFilters.value && scriptEditorDefaultFilters.value.length > 0){
    selectedDefaultFilters.value = [...scriptEditorDefaultFilters.value]
  } else {
    selectedDefaultFilters.value = [...allFilterItems.value]
  }
}, { immediate: true })

function getEffectiveFilters(filters) {
  return filters && filters.length > 0 ? filters : allFilterItems.value
}

function checkCanSave() {
  isCanSave.value = !isEqual(tooltipDelayOptions.value, {...tooltipDelay.value })
      || isDarkMode.value !== (themes.value.dark === theme.value)
      || selectedLanguage.value !== language.value
      || !isEqual([...selectedDefaultFilters.value].sort(), [...getEffectiveFilters(scriptEditorDefaultFilters.value)].sort())
}
watch(tooltipDelayOptions, checkCanSave, { immediate: true, deep: true })
watch(isDarkMode, checkCanSave, { immediate: true, deep: true })
watch(selectedLanguage, checkCanSave, { immediate: true })
watch(selectedDefaultFilters, checkCanSave, { immediate: true, deep: true })
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>