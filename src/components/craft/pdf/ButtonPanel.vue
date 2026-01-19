<template>
  <div>
    <div class="flex flex-col items-center gap-3 h-full">
      <div v-if="isShowPdfError" @click.stop="" class="fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center z-50">
        <div class="rounded-2xl shadow-lg p-5 w-150 text-center bg-[color:var(--color-bg)]">
          <h2 class="text-xl font-semibold mb-10 title-theme">{{ $t('errors.pdfGenerationTitle') }}</h2>
          <p class="mb-10 text-theme">{{ $t('errors.pdfGenerationDesc') }}</p>
          <div class="flex justify-center">
            <button
                @click="isShowPdfError = false"
                class="px-4 py-2 rounded-md cursor-pointer text-theme bg-[color:var(--color-border)] hover:bg-[color:var(--color-hover-bg)]"
            >
              {{ $t('buttons.confirm') }}
            </button>
          </div>
        </div>
      </div>

      <!-- History button with popup -->
      <div class="relative">
        <action-button
            icon="history"
            icon-size="w-7 h-7"
            button-class="w-12 h-12"
            :icon-color="hasHistory
                ? 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'
                : 'fill-[color:var(--color-disable-bg)] group-hover:fill-[color:var(--color-disable-bg)]'"
            :button-color="hasHistory
                ? 'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'
                : 'border-[color:var(--color-disable-bg)] group-hover:border-[color:var(--color-disable-bg)]'"
            :handle="toggleHistoryPopup"
            :is-disable="!hasHistory"
            :tooltip="historyTooltip" />
        <!-- History popup -->
        <div v-if="isHistoryPopupOpen"
             class="absolute right-14 top-0 z-50 w-80 min-h-[280px] max-h-[560px] overflow-y-auto rounded-lg shadow-lg bg-[color:var(--color-bg)] border border-[color:var(--color-border)]">
          <div class="sticky top-0 z-10 px-3 py-3 font-semibold text-base border-b border-[color:var(--color-border)] bg-[var(--color-bg)] title-theme">
            {{ $t('history.title') }}
          </div>
          <div class="py-1">
            <div v-for="(item, index) in historyList"
                 :key="index"
                 @click="handleHistoryItemClick(index)"
                 :class="[
                   'px-3 py-2 text-sm transition-colors',
                   item.isCurrent
                     ? 'bg-[color:var(--color-list-element)] text-theme'
                     : 'cursor-pointer hover:bg-[color:var(--color-hover-bg)] text-theme',
                   item.isFuture ? 'opacity-70' : ''
                 ]">
              <div v-if="item.isCurrent" class="flex justify-between items-center">
                <span class="font-medium">{{ $t('history.current') }}</span>
                <span class="text-xs opacity-60">{{ formatHistoryTime(item.timestamp) }}</span>
              </div>
              <template v-else>
                <div class="flex justify-between items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <div :class="[item.isFuture ? 'italic' : '', 'truncate']"
                         :title="item.actionValue ? `${getStepDirection(index)}, ${item.actionValue}` : getStepDirection(index)">
                      {{ getStepDirection(index) }}<template v-if="item.actionValue">, <span class="font-medium text-[color:var(--color-title-text)]">{{ item.actionValue }}</span></template>
                    </div>
                    <div v-if="item.actionType && item.actionType !== 'unknown'" class="text-xs opacity-60 truncate">
                      {{ getActionTypeLabel(item.actionType) }}
                    </div>
                  </div>
                  <span class="text-xs opacity-60 shrink-0">{{ formatHistoryTime(item.timestamp) }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <!-- Backdrop to close popup -->
        <div v-if="isHistoryPopupOpen"
             class="fixed inset-0 z-40"
             @click="isHistoryPopupOpen = false" />
      </div>

      <action-button
          icon="undo"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="canUndoValue
              ? 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'
              : 'fill-[color:var(--color-disable-bg)] group-hover:fill-[color:var(--color-disable-bg)]'"
          :button-color="canUndoValue
              ? 'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'
              : 'border-[color:var(--color-disable-bg)] group-hover:border-[color:var(--color-disable-bg)]'"
          :handle="handleUndo"
          :is-disable="!canUndoValue"
          :tooltip="undoTooltip" />
      <action-button
          icon="redo"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="canRedoValue
              ? 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'
              : 'fill-[color:var(--color-disable-bg)] group-hover:fill-[color:var(--color-disable-bg)]'"
          :button-color="canRedoValue
              ? 'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'
              : 'border-[color:var(--color-disable-bg)] group-hover:border-[color:var(--color-disable-bg)]'"
          :handle="handleRedo"
          :is-disable="!canRedoValue"
          :tooltip="redoTooltip" />
      <action-button
          icon="options"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          :icon-color="'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleOptions"
          :tooltip="tooltipOptions" />
      <action-button
          icon="list"
          icon-size="w-6.5 h-6.5"
          button-class="w-12 h-12"
          :icon-color="'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
          :button-color="'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
          :handle="handleNightOrder"
          :tooltip="tooltipNightOrder"
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
          :warning-tooltip="warningTooltipClipboard"
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
      <div v-if="isBootleggersEnabled" class="relative">
        <action-button
            icon="bootlegger"
            icon-size="w-8 h-8"
            button-class="w-12 h-12"
            :icon-color="'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]'"
            :button-color="'border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]'"
            :handle="handleBootlegger"
            :tooltip="$t('tooltips.bootleggerRules')" />
        <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold bg-[color:var(--color-hover-bg)] text-[color:var(--color-title-text)]" style="font-size: 11px;">
          {{ bootleggerCount }}
        </div>
      </div>

      <action-button
          icon="backIcon"
          icon-size="w-8 h-8"
          button-class="w-12 h-12"
          icon-color="fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-hover-bg)]"
          button-color="border-[color:var(--color-text)] group-hover:border-[color:var(--color-hover-bg)]"
          :handle="handleToScriptList"
          :tooltip="tooltipBack"
          class="mt-6" />
    </div>
  </div>
</template>
<script setup>
import html2pdf from "html2pdf.js";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {computed, ref, onMounted, onUnmounted} from "vue";
import {useI18n} from "vue-i18n";
import {isEmpty} from "lodash/lang";
import {DEFAULT_SCRIPT_NAME, NPC_ROLES} from "@/constants/roles";
import {DEFAULT_VERSION} from "@/constants/other";
import ActionButton from "@/components/ui/ActionButton.vue";
import router from "@/router";
import { undo, redo, canUndo, canRedo, deleteDraft, saveDraft, historyList, goToHistoryStep, currentIndex } from "@/store/craft/history";
import { skipDraftOnLeave } from "@/store/craft/state";
import IconElement from "@/components/ui/IconElement.vue";

const { t, locale } = useI18n()

const isShowPdfError = ref(false)
const isHistoryPopupOpen = ref(false)

const craftStore = useCraftStore()
const { pdfMeta, pdfListElement, isOpenPdfOptions, isOpenNightOrder, isOpenBootlegger, isSavedScript, isWaitingOperation, pdfListWithParams, isEditingScript, nightOrderAutoGenerated, isNightOrderMismatch, focusSearchTrigger } = storeToRefs(craftStore)
const isEmptyList = computed(() => isEmpty(Object.values(pdfListWithParams.value).flat()))
const isBootleggersEnabled = computed(() => {
  return NPC_ROLES.some(role => pdfListWithParams.value[role]?.find(el => el.id === 'bootlegger'))
})
const bootleggerCount = computed(() => {
  return pdfMeta.value?.bootlegger?.length || 0
})

// Undo/Redo computed values
const canUndoValue = computed(() => canUndo.value)
const canRedoValue = computed(() => canRedo.value)
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
const undoTooltip = computed(() => t('tooltips.undo', { key: isMac ? 'Cmd' : 'Ctrl' }))
const redoTooltip = computed(() => t('tooltips.redo', { key: isMac ? 'Cmd' : 'Ctrl' }))
const historyTooltip = computed(() => t('tooltips.history'))
const hasHistory = computed(() => historyList.value.length > 1)

// Format time for history list
function formatHistoryTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Handle history item click
function handleHistoryItemClick(index) {
  if (index === currentIndex.value) return // Current state, do nothing
  goToHistoryStep(index)
  isHistoryPopupOpen.value = false
}

// Get step direction for history item (e.g. "1 назад")
function getStepDirection(index) {
  const currIdx = currentIndex.value
  return index < currIdx
    ? t('history.stepForward', { n: currIdx - index })
    : t('history.stepBack', { n: index - currIdx })
}

// Get action type translation
function getActionTypeLabel(actionType) {
  if (!actionType || actionType === 'unknown') return ''
  return t(`history.actions.${actionType}`)
}

// Toggle history popup
function toggleHistoryPopup() {
  isHistoryPopupOpen.value = !isHistoryPopupOpen.value
}

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

  // Убрано: isNightOrderMismatch уже показывается на кнопке night order

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

const modifierKey = isMac ? 'Cmd' : 'Ctrl'

const tooltipSave = computed(() => {
  return t('tooltips.saveScript', { key: modifierKey })
})
const tooltipClipboard = computed(() => {
  return t('tooltips.copyToClipboard', { key: modifierKey })
})
const tooltipPdf = computed(() => {
  return t('tooltips.downloadPdf', { key: modifierKey })
})
const tooltipJson = computed(() => {
  return t('tooltips.downloadJson', { key: modifierKey })
})
const tooltipOptions = computed(() => {
  return t('tooltips.scriptOptions', { key: modifierKey })
})
const tooltipNightOrder = computed(() => {
  return t('tooltips.nightOrder', { key: modifierKey })
})
const tooltipBack = computed(() => {
  return t('tooltips.returnToScriptList', { key: modifierKey })
})

const warningTooltipClipboard = computed(() => {
  if (isEmptyList.value) {
    return t('tooltips.notAvailableEmptyScript')
  }
  return ''
})

const warningTooltipExport = computed(() => {
  if (isEmptyList.value) {
    return t('tooltips.notAvailableEmptyScript')
  }
  if (!isSavedScript.value) {
    return t('tooltips.notSavedToLibrary')
  }
  return ''
})

function handleOptions(){
  isOpenPdfOptions.value = !isOpenPdfOptions.value
}

function handleNightOrder(){
  isOpenNightOrder.value = !isOpenNightOrder.value
}

function handleBootlegger(){
  isOpenBootlegger.value = !isOpenBootlegger.value
}

function handleUndo(){
  undo()
}

function handleRedo(){
  redo()
}

async function handleSaveScript(){
  if(!isActiveActionButton.value) return
  isWaitingOperation.value = true
  try {
    await craftStore.saveCurrentScript()
    isSavedScript.value = true
    nightOrderAutoGenerated.value = false
    // Delete draft after successful save
    await deleteDraft()
    isEditingScript.value = false
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

    // Считаем ожидаемое количество страниц из HTML
    const expectedPages = pdfListElement.value.querySelectorAll('.pdf-page').length

    const pdf = await html2pdf()
        .set({
          filename:     `${pdfMeta.value.name}_v${pdfMeta.value.version || DEFAULT_VERSION}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 3 },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
          pagebreak:    { mode: 'avoid-all', before: '.page-break-before', after: '.page-break-after' }
        })
        .from(pdfListElement.value)
        .toPdf()
        .get('pdf')

    // Удаляем лишние пустые страницы в конце
    const totalPages = pdf.internal.getNumberOfPages()
    if (totalPages > expectedPages) {
      for (let i = totalPages; i > expectedPages; i--) {
        pdf.deletePage(i)
      }
    }

    if(isSavedScript.value) {
      const arrayBuffer = await pdf.output('arraybuffer')
      const content = new Uint8Array(arrayBuffer)
      await craftStore.savePdf(content)
    }
    pdf.save(`${pdfMeta.value.name}_v${pdfMeta.value.version || DEFAULT_VERSION}.pdf`)

    craftStore.resetPrintPreparationTrigger()
    isWaitingOperation.value = false
    return true
  } catch(e) {
    craftStore.resetPrintPreparationTrigger()
    isWaitingOperation.value = false
    isShowPdfError.value = true
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

async function handleToScriptList(){
  // Set flag to skip draft handling in onBeforeRouteLeave
  skipDraftOnLeave.value = true
  // Save draft if there are unsaved changes, otherwise delete it
  if (isEditingScript.value) {
    await saveDraft({
      name: pdfMeta.value?.name || null
    })
  } else {
    await deleteDraft()
  }
  isEditingScript.value = false
  nightOrderAutoGenerated.value = false
  await router.replace({ name: 'scriptList' })
}

// Keyboard shortcuts handler
function handleKeydown(e) {
  const modifier = isMac ? e.metaKey : e.ctrlKey
  if (!modifier) return

  // Check if user is typing in an input field
  const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)

  switch (e.key.toLowerCase()) {
    case 'z':
      if (!e.shiftKey) {
        e.preventDefault()
        undo()
      } else {
        e.preventDefault()
        redo()
      }
      break
    case 'y':
      e.preventDefault()
      redo()
      break
    case 'o':
      e.preventDefault()
      handleOptions()
      break
    case 'n':
      e.preventDefault()
      handleNightOrder()
      break
    case 's':
      e.preventDefault()
      handleSaveScript()
      break
    case 't':
      if (!isInputFocused) {
        e.preventDefault()
        handleToClipboard()
      }
      break
    case 'p':
      e.preventDefault()
      handleDownloadPdf()
      break
    case 'j':
      e.preventDefault()
      handleDownloadJson()
      break
    case 'f':
      e.preventDefault()
      focusSearchTrigger.value++
      break
    case 'backspace':
      e.preventDefault()
      handleToScriptList()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
