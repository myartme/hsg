<template>
  <div>
    <div :class="[
        'grid list-element grid-cols-[3rem_3rem_minmax(auto,50%)_minmax(150px,1fr)_3rem_3rem]',
         isSelected
            ? 'bg-[color:var(--color-list-element)] hover:bg-[color:var(--color-hover-active)]'
            : 'bg-[color:var(--color-bg)] hover:bg-[color:var(--color-hover-bg)]'
    ]">
      <span class="flex justify-center font-bold text-center text-theme">{{ index + 1 }}</span>
      <div class="w-10 h-10 relative">
        <img v-if="script?.logo"
             class="absolute inset-0 w-full h-full object-cover rounded scale-110"
             :src="script.logo"
             :alt="script.name" />
      </div>
      <span class="block break-words whitespace-normal font-bold title-theme">{{ script?.name }}</span>
      <span class="text-xs text-theme">{{ script?.author }}</span>
      <span class="text-xs text-theme">{{ script?.list?.length }}({{ script?.version }})</span>
      <action-button
          icon="options"
          icon-size="w-7 h-7"
          button-class="w-9 h-9"
          tooltip="Script common options"
          @click.stop="isOpenOptions" />
    </div>
    <sector-container v-if="isSelected"
                      :name="instance?.type.name"
                      container-class="pt-1 pb-0"
                      content-class="w-full pl-[5%]">
      <template #content>
        <div class="flex flex-wrap gap-1 max-w-fit">
          <div v-for="(element, index) in list"
               :key="index"
               @click="(event) => selectScript(element, event)"
               :class="[
                   'flex list-element h-12 w-100',
                   element.version === activeVersion
                     ? 'bg-[color:var(--color-list-element)] hover:bg-[color:var(--color-hover-active)]'
                     : 'bg-[color:var(--color-bg)] hover:bg-[color:var(--color-hover-bg)]'
          ]">
            <div class="flex justify-between items-center w-full px-3">
              <span class="font-bold text-theme">Open v{{ element?.version }}</span>
              <div class="flex gap-2">
                <action-button
                    icon="downloadJson"
                    icon-size="w-6 h-6"
                    button-class="w-9 h-9"
                    :icon-color="!element.json ? 'fill-[color:var(--color-disable-bg)] hover:fill-[color:var(--color-disable-bg)]' : ''"
                    :button-color="!element.json ? 'border-[color:var(--color-disable-bg)] hover:border-[color:var(--color-disable-bg)]' : ''"
                    :is-disable="!element.json"
                    @click.stop="handleDownloadJson(element)"
                    :tooltip="!element.json ? 'No json file available' : 'Download last generated json'" />
                <action-button
                    icon="toClipboard"
                    icon-size="w-6 h-6"
                    button-class="w-9 h-9"
                    :icon-color="!element.json ? 'fill-[color:var(--color-disable-bg)] hover:fill-[color:var(--color-disable-bg)]' : ''"
                    :button-color="!element.json ? 'border-[color:var(--color-disable-bg)] hover:border-[color:var(--color-disable-bg)]' : ''"
                    :is-disable="!element.json"
                    @click.stop=""
                    :handle="async () => await handleToClipboard(element)"
                    :is-show-effect="true"
                    :tooltip="!element.json ? 'Not available' : 'Copy to clipboard'" />
                <action-button
                    icon="downloadPdf"
                    icon-size="w-6 h-6"
                    button-class="w-9 h-9"
                    :icon-color="!element.pdf ? 'fill-[color:var(--color-disable-bg)] hover:fill-[color:var(--color-disable-bg)]' : ''"
                    :button-color="!element.pdf ? 'border-[color:var(--color-disable-bg)] hover:border-[color:var(--color-disable-bg)]' : ''"
                    :is-disable="!element.pdf"
                    @click.stop="handleDownloadPdf(element)"
                    :tooltip="!element.pdf ? 'No pdf file available' : 'Download last generated pdf'" />
                <action-button v-if="element.characters?.length > 0"
                    icon="eye"
                    icon-size="w-7 h-7"
                    @click.stop=""
                    :tooltip="getPreviewTooltip(element.characters)"
                    button-class="w-9 h-9" />
                <action-button
                    icon="delete"
                    icon-size="w-6 h-6"
                    @click.stop="isVisibleDeleteDialog = true; deletingVersion = element?.version"
                    tooltip="Delete this version"
                    button-class="w-9 h-9" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </sector-container>
    <confirm-dialog v-if="isVisibleDeleteDialog"
                    :title="`Deleting ${script.name} v${deletingVersion}`"
                    description="This action cannot be undone. Are you sure you want to delete this character?"
                    @confirm="handleDeleteScript()"
                    @cancel="isVisibleDeleteDialog = false; deletingVersion = DEFAULT_VERSION" />
  </div>
</template>
<script setup>
import {computed, getCurrentInstance, ref, watch} from "vue";
import SectorContainer from "@/components/SectorContainer.vue";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import router from "@/router";
import ActionButton from "@/components/ui/ActionButton.vue";
import {DEFAULT_VERSION, getImageFirstUrl, objectToPrettyJson} from "@/constants/other";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import {pdfMeta} from "@/store/craft/state";
import {useLibraryStore} from "@/store/library";

const props = defineProps({
  scriptData: Object,
  filteredCharacterList: {
    type: Array,
    default: []
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const libraryStore = useLibraryStore()
const craftStore = useCraftStore()
const instance = getCurrentInstance()
const { allListsAsOne } = storeToRefs(libraryStore)
const { activeScriptIndex, activeScript, activeVersion, isSavedScript } = storeToRefs(craftStore)
const list = ref([])
const isVisibleDeleteDialog = ref(false)
const deletingVersion = ref(DEFAULT_VERSION)
const index = computed(() => props.scriptData.index)
const script = computed(() => props.scriptData.script)
const emits = defineEmits(['isOpenOptions', 'onEmptyList'])

function selectScript(element, event){
  event.stopPropagation()
  activeVersion.value = element.version
  isSavedScript.value = true
  craftStore.loadScriptWithMetaFilling(element.version, activeScript.value.name)
  router.push({ name: 'scriptEdit' })
}

async function handleDownloadPdf(element){
  if(!element.pdf) return

  const base64 = await craftStore.loadPdf(element.version, script.value.name)
  if (!base64) return

  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  generateDownload(
      bytes,
      'application/pdf',
      `${script.value.name}_v${element.version}.pdf`
  )
}

async function handleDownloadJson(element){
  if(!element.json) return

  const result = await craftStore.loadScript(element.version, script.value.name)
  if (result?.isSuccess && result.content) {
    generateDownload(
        objectToPrettyJson(result.content),
        'application/json',
        `${script.value.name}_v${element.version}.json`
    )
  }
}

async function handleToClipboard(element){
  if(element.json){
    const result = await craftStore.loadScript(element.version, script.value.name)
    if (result?.isSuccess && result.content) {
      await navigator.clipboard.writeText(objectToPrettyJson(result.content))
      return true
    }
  }

  return false
}

async function handleDeleteScript(){
  isVisibleDeleteDialog.value = false
  await craftStore.deleteScript(deletingVersion.value, script.value.name)
}

function isOpenOptions(){
  emits('isOpenOptions')
  pdfMeta.value = script.value
}

function generateDownload(content, format, fileName){
  const blob = new Blob([content], { type: format })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getPreviewTooltip(elements){
  const images = elements.map(name => {
    const found = Object.values(allListsAsOne.value).flat().find(obj => obj.id === name)
    return found ? getImageFirstUrl(found) : null
  })

  let result = '<div class="flex flex-wrap">'
  images.forEach(el => {
    result += `<img src="${el}" class="w-12 h-12" />`
  })
  result += '</div>'

  return result
}

watch(activeScriptIndex, () => {
  if(props.filteredCharacterList?.length > 0){
    if(activeScript.value?.list) {
      list.value = activeScript.value.list.filter(item =>
          item.characters ? item.characters?.some(charId => props.filteredCharacterList.includes(charId)) : false
      )
    }
  } else {
    list.value = activeScript.value?.list
  }
}, { immediate: true })
</script>