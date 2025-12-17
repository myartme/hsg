<template>
  <div>
    <div class="flex flex-col items-center gap-3 h-full">
      <confirm-dialog
          v-if="isShowLeaveConfirm"
          :title="$t('scriptEditor.unsavedChangesTitle')"
          :description="$t('scriptEditor.unsavedChangesDesc')"
          @confirm="confirmLeave"
          @cancel="isShowLeaveConfirm = false" />
      <action-button
          icon="options"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleOptions"
          :tooltip="$t('tooltips.scriptOptions')" />
      <action-button
          icon="list"
          icon-size="w-6.5 h-6.5"
          button-class="w-12 h-12"
          :icon-color="'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleNightOrder"
          :tooltip="$t('tooltips.nightOrder')"
          :warning-tooltip="isNightOrderMismatch ? $t('tooltips.nightOrderMismatch') : ''" />
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
          :warning-tooltip="warningTooltipExport"
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
          :warning-tooltip="warningTooltipExport"
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
          :warning-tooltip="warningTooltipExport"
          :is-show-effect="!isEmptyList" />

      <action-button
          icon="backIcon"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          icon-color="fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]"
          button-color="border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]"
          :handle="handleToScriptList"
          :tooltip="$t('tooltips.returnToScriptList')"
          class="mt-6" />
    </div>
  </div>
</template>
<script setup>
import html2pdf from "html2pdf.js";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {isEmpty} from "lodash/lang";
import {DEFAULT_SCRIPT_NAME} from "@/constants/roles";
import {DEFAULT_VERSION} from "@/constants/other";
import ActionButton from "@/components/ui/ActionButton.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import router from "@/router";

const { t } = useI18n()

const isShowLeaveConfirm = ref(false)

const craftStore = useCraftStore()
const { pdfMeta, pdfListElement, isOpenPdfOptions, isOpenNightOrder, isSavedScript, isWaitingOperation, pdfListWithParams, isEditingScript, nightOrderAutoGenerated, isNightOrderMismatch } = storeToRefs(craftStore)
const isEmptyList = computed(() => isEmpty(Object.values(pdfListWithParams.value).flat()))

const isActiveActionButton = computed(() => {
  return pdfMeta.value.name !== DEFAULT_SCRIPT_NAME && !isEmptyList.value
})

const warningTooltipSave = computed(() => {
  const issues = []

  if (!isActiveActionButton.value) {
    if (pdfMeta.value.name === DEFAULT_SCRIPT_NAME) {
      issues.push(t('tooltips.notAvailableDefaultName'))
    }
    if (pdfMeta.value.name === '') {
      issues.push(t('tooltips.notAvailableEmptyName'))
    }
    if (isEmptyList.value) {
      issues.push(t('tooltips.notAvailableEmptyScript'))
    }
  }

  if (nightOrderAutoGenerated.value && isEditingScript.value) {
    issues.push(t('tooltips.nightOrderMissing'))
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

const listCheckTooltip = () => isEmptyList.value ? t('tooltips.notAvailableEmptyScript') + '<br>' : ''
const saveCheckTooltip = () => !isSavedScript.value ? t('tooltips.notSavedToLibrary') + '<br>' : ''

const tooltipSave = computed(() => {
  return t('tooltips.saveScript')
})
const tooltipClipboard = computed(() => {
  return !isEmptyList.value ? t('tooltips.copyToClipboard') + '<br>' : listCheckTooltip()
})
const tooltipPdf = computed(() => {
  return !isEmptyList.value ? t('tooltips.downloadPdf') + '<br>' : saveCheckTooltip()
})
const tooltipJson = computed(() => {
  return !isEmptyList.value ? t('tooltips.downloadJson') + '<br>' : saveCheckTooltip()
})

const warningTooltipExport = computed(() => {
  const issues = []

  if (!isSavedScript.value) {
    issues.push(t('tooltips.notSavedToLibrary'))
  }

  if (isNightOrderMismatch.value) {
    issues.push(t('tooltips.nightOrderMismatch'))
  }

  return issues.join("<br><br>")
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
