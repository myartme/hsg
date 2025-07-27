<template>
  <div>
    <div class="flex flex-col items-center gap-3 h-full">
      <action-button
          icon="options"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="'fill-[color:var(--color-text)] hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="'border-[color:var(--color-text)] hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleOptions"
          tooltip="Script options" />
      <action-button
          icon="save"
          icon-size="w-7 h-7"
          button-class="w-12 h-12"
          :icon-color="!isActiveActionButton
              ? 'fill-[color:var(--color-disable-bg)] hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="!isActiveActionButton
              ? 'border-[color:var(--color-disable-bg)] hover:border-[color:var(--color-disable-bg)]'
              : 'border-[color:var(--color-text)] hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleSaveScript"
          :is-disable="!isActiveActionButton"
          :tooltip="tooltipSave"
          :is-show-effect="isActiveActionButton" />
      <action-button
          icon="toClipboard"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="!isActiveActionButton
              ? 'fill-[color:var(--color-disable-bg)] hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="!isActiveActionButton
              ? 'border-[color:var(--color-disable-bg)] hover:border-[color:var(--color-disable-bg)]'
              : 'border-[color:var(--color-text)] hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleToClipboard"
          :is-disable="!isActiveActionButton"
          :tooltip="tooltipClipboard"
          :is-show-effect="!isEmptyList" />
      <action-button
          icon="downloadPdf"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="!isActiveActionButton
              ? 'fill-[color:var(--color-disable-bg)] hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="!isActiveActionButton
              ? 'border-[color:var(--color-disable-bg)] hover:border-[color:var(--color-disable-bg)]'
              : 'border-[color:var(--color-text)] hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleDownloadPdf"
          :is-disable="!isActiveActionButton"
          :tooltip="tooltipPdf"
          :is-show-effect="!isEmptyList" />
      <action-button
          icon="downloadJson"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="!isActiveActionButton
              ? 'fill-[color:var(--color-disable-bg)] hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="!isActiveActionButton
              ? 'border-[color:var(--color-disable-bg)] hover:border-[color:var(--color-disable-bg)]'
              : 'border-[color:var(--color-text)] hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleDownloadJson"
          :is-disable="!isActiveActionButton"
          :tooltip="tooltipJson"
          :is-show-effect="!isEmptyList" />
    </div>
  </div>
</template>
<script setup>
import html2pdf from "html2pdf.js";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {computed} from "vue";
import {isEmpty} from "lodash/lang";
import {DEFAULT_SCRIPT_NAME} from "@/constants/roles";
import {DEFAULT_VERSION} from "@/constants/other";
import ActionButton from "@/components/ui/ActionButton.vue";

const craftStore = useCraftStore()
const { pdfMeta, activeVersion, pdfListElement, isOpenPdfOptions, isSavedScript, isWaitingOperation, pdfListWithParams } = storeToRefs(craftStore)
const isEmptyList = computed(() => isEmpty(Object.values(pdfListWithParams.value).flat()))

const isActiveActionButton = computed(() => {
  return pdfMeta.value.name !== DEFAULT_SCRIPT_NAME && !isEmptyList.value
})

const nameCheckTooltip = () => pdfMeta.value.name === DEFAULT_SCRIPT_NAME ? "Not available with default name<br>" : ''
const listCheckTooltip = () => isEmptyList.value ? "Not available while script is empty<br>" : ''
const saveCheckTooltip = () => !isSavedScript.value ? "The script is not saved, so the file will not be saved to the library<br>" : ''

const tooltipSave = computed(() => {
  return isActiveActionButton.value ? 'Save script to library' : nameCheckTooltip() + listCheckTooltip()
})
const tooltipClipboard = computed(() => {
  return !isEmptyList.value ? 'Copy to clipboard' : listCheckTooltip()
})
const tooltipPdf = computed(() => {
  return "Download Pdf<br>" + saveCheckTooltip()
})
const tooltipJson = computed(() => {
  return "Download Json<br>" + saveCheckTooltip()
})

function handleOptions(){
  isOpenPdfOptions.value = !isOpenPdfOptions.value
}

async function handleSaveScript(){
  if(!isActiveActionButton.value) return
  isWaitingOperation.value = true
  try {
    await craftStore.saveCurrentScript()
    isSavedScript.value = true
    await craftStore.loadScriptWithMetaFilling(activeVersion.value, pdfMeta.value.name)
    setTimeout(() => {
      isWaitingOperation.value = false
    }, 1000)
    return true
  } catch {
    setTimeout(() => {
      isWaitingOperation.value = false
    }, 1000)
    return false
  }
}

function handleToClipboard(){
  if(isEmptyList.value) return

  try {
    navigator.clipboard.writeText(craftStore.getJsonCurrentScriptContent())
    return true
  } catch {
    return false
  }
}

async function handleDownloadPdf(){
  if(isEmptyList.value) return
  isWaitingOperation.value = true
  try {
    craftStore.triggerPrintPreparation()
    await craftStore.waitForReadyToPrint()

    const pdfInstance = html2pdf()
        .set({
          filename:     `${pdfMeta.value.name}_v${pdfMeta.value.version || DEFAULT_VERSION}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 3 },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        })
        .from(pdfListElement.value)
        .toPdf()
        .get('pdf')
    if(isSavedScript.value) {
      const arrayBuffer = await pdfInstance.output('arraybuffer')
      const content = new Uint8Array(arrayBuffer)
      await craftStore.savePdf(content)
    }
    pdfInstance.save()

    craftStore.resetPrintPreparationTrigger()
    isWaitingOperation.value = false
    return true
  } catch(e) {
    craftStore.resetPrintPreparationTrigger()
    isWaitingOperation.value = false
    return false
  }
}

function handleDownloadJson(){
  if(isEmptyList.value) return
  isWaitingOperation.value = true

  try {
    const data = craftStore.getJsonCurrentScriptContent()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${pdfMeta.value.name}_v${pdfMeta.value.version || DEFAULT_VERSION}.json`
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
