<template>
  <div>
    <div class="flex flex-col items-center gap-3 h-full">
      <confirm-dialog
          v-if="isShowLeaveConfirm"
          title="Unsaved Changes"
          description="Do you really want to leave this page? All unsaved data will be lost."
          @confirm="confirmLeave"
          @cancel="isShowLeaveConfirm = false" />
      <action-button
          icon="options"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleOptions"
          tooltip="Script options" />
      <action-button
          icon="list"
          icon-size="w-6.5 h-6.5"
          button-class="w-12 h-12"
          :icon-color="'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleNightOrder"
          tooltip="Night Order" />
      <action-button
          icon="save"
          icon-size="w-7 h-7"
          button-class="w-12 h-12"
          :icon-color="!isActiveActionButton
              ? 'fill-[color:var(--color-disable-bg)] group-hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="getButtonStyle"
          :handle="handleSaveScript"
          :is-disable="!isActiveActionButton"
          :tooltip="tooltipSave"
          :warning-tooltip="warningTooltipSave"
          :is-show-effect="isActiveActionButton" />
      <action-button
          icon="toClipboard"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="isEmptyList
              ? 'fill-[color:var(--color-disable-bg)] group-hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="isEmptyList
              ? 'border-[color:var(--color-disable-bg)] group-hover:border-[color:var(--color-disable-bg)]'
              : 'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleToClipboard"
          :is-disable="isEmptyList"
          :tooltip="tooltipClipboard"
          :is-show-effect="!isEmptyList" />
      <action-button
          icon="downloadPdf"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="isEmptyList
              ? 'fill-[color:var(--color-disable-bg)] group-hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="isEmptyList
              ? 'border-[color:var(--color-disable-bg)] group-hover:border-[color:var(--color-disable-bg)]'
              : 'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleDownloadPdf"
          :is-disable="isEmptyList"
          :tooltip="tooltipPdf"
          :is-show-effect="!isEmptyList" />
      <action-button
          icon="downloadJson"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="isEmptyList
              ? 'fill-[color:var(--color-disable-bg)] group-hover:fill-[color:var(--color-disable-bg)]'
              : 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="isEmptyList
              ? 'border-[color:var(--color-disable-bg)] group-hover:border-[color:var(--color-disable-bg)]'
              : 'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleDownloadJson"
          :is-disable="isEmptyList"
          :tooltip="tooltipJson"
          :is-show-effect="!isEmptyList" />

      <action-button
          icon="backIcon"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          icon-color="fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]"
          button-color="border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]"
          :handle="handleToScriptList"
          tooltip="Return to script list"
          class="mt-6" />
    </div>
  </div>
</template>
<script setup>
import html2pdf from "html2pdf.js";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {computed, ref} from "vue";
import {isEmpty} from "lodash/lang";
import {DEFAULT_SCRIPT_NAME} from "@/constants/roles";
import {DEFAULT_VERSION} from "@/constants/other";
import ActionButton from "@/components/ui/ActionButton.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import router from "@/router";

const isShowLeaveConfirm = ref(false)

const craftStore = useCraftStore()
const { pdfMeta, pdfListElement, isOpenPdfOptions, isOpenNightOrder, isSavedScript, isWaitingOperation, pdfListWithParams, isEditingScript, nightOrderAutoGenerated } = storeToRefs(craftStore)
const isEmptyList = computed(() => isEmpty(Object.values(pdfListWithParams.value).flat()))

const isActiveActionButton = computed(() => {
  return pdfMeta.value.name !== DEFAULT_SCRIPT_NAME && !isEmptyList.value
})

const warningTooltipSave = computed(() => {
  const issues = []

  if (!isActiveActionButton.value) {
    if (pdfMeta.value.name === DEFAULT_SCRIPT_NAME) {
      issues.push("Not available with default name. Change it in the settings or on the script list.")
    }
    if (pdfMeta.value.name === '') {
      issues.push("Not available with empty name. Change it in the settings or on the script list.")
    }
    if (isEmptyList.value) {
      issues.push("Not available while script is empty.")
    }
  }

  if (nightOrderAutoGenerated.value && isEditingScript.value) {
    issues.push("Night order is missing and filled with default values. You can change them in the corresponding section. Resave the script to fix it.")
  }

  return issues.join("<br><br>")
})

const getButtonStyle = computed(() => {
  let style = ''
  if(!isActiveActionButton.value){
    style += ' border-[color:var(--color-disable-bg)] group-hover:border-[color:var(--color-disable-bg)] '
  } else {
    style += ' group-hover:border-[color:var(--color-hover-bg)] '
    style += isEditingScript.value ? ' border-[color:var(--color-error)] ' : ' border-[color:var(--color-active)] '
  }

  return style
})

const listCheckTooltip = () => isEmptyList.value ? "Not available while script is empty<br>" : ''
const saveCheckTooltip = () => !isSavedScript.value ? "The script is not saved, so the file will not be saved to the library<br>" : ''

const tooltipSave = computed(() => {
  return "Save script to library"
})
const tooltipClipboard = computed(() => {
  return !isEmptyList.value ? "Copy to clipboard<br>" : listCheckTooltip()
})
const tooltipPdf = computed(() => {
  return !isEmptyList.value ? "Download Pdf<br>" : saveCheckTooltip()
})
const tooltipJson = computed(() => {
  return !isEmptyList.value ? "Download Json<br>" : saveCheckTooltip()
})

function handleOptions(){
  isOpenPdfOptions.value = !isOpenPdfOptions.value
}

function handleNightOrder(){
  isOpenNightOrder.value = !isOpenNightOrder.value
}

async function handleSaveScript(){
  if(!isActiveActionButton.value) return
  isWaitingOperation.value = true
  try {
    await craftStore.saveCurrentScript()
    isSavedScript.value = true
    nightOrderAutoGenerated.value = false
    setTimeout(() => {
      isWaitingOperation.value = false
      if(isEditingScript.value){
        isEditingScript.value = false
      }
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
  if(isEmptyList.value || !isActiveActionButton.value) return

  try {
    navigator.clipboard.writeText(craftStore.getJsonCurrentScriptContent())
    return true
  } catch {
    return false
  }
}

async function handleDownloadPdf(){
  if(isEmptyList.value || !isActiveActionButton.value) return
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
  if(isEmptyList.value || !isActiveActionButton.value) return
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

function handleToScriptList(){
  if (isEditingScript.value) {
    isShowLeaveConfirm.value = true
  } else {
    confirmLeave()
  }
}

async function confirmLeave(){
  isShowLeaveConfirm.value = false
  isEditingScript.value = false
  nightOrderAutoGenerated.value = false
  await router.replace({ name: 'scriptList' })
}
</script>
