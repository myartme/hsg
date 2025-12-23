<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden relative">
    <full-character-list-craft />
    <preview-pdf />
    <result-generator class="absolute top-full pointer-events-none opacity-0" />
    <button-panel />
    <script-options-popup
        v-model:is-open="isOpenPdfOptions"
        :isBootleggersEnabled="isBootleggersEnabled" />
    <script-night-order-popup
        v-model:is-open="isOpenNightOrder" />
    <bootlegger-popup
        v-model:is-open="isOpenBootlegger" />
    <spinner v-if="isWaitingOperation"
             item-class="fixed inset-0 z-50 bg-black/60 pointer-events-auto flex justify-center items-center" size="w-20 h-20" />

    <!-- Draft restore dialog -->
    <confirm-dialog
        v-if="isShowRestoreDialog"
        :title="$t('scriptEditor.draftFound')"
        :description="$t('scriptEditor.draftDescription', {
          name: draftInfo?.current?.meta?.name || $t('scripts.defaultName'),
          author: draftInfo?.current?.meta?.author ? `, ${draftInfo.current.meta.author}` : '',
          date: formatDraftDate(draftInfo?.timestamp)
        })"
        :confirm-text="$t('scriptEditor.restoreDraft')"
        :cancel-text="$t('scriptEditor.discardDraft')"
        :confirm-primary="true"
        :cancel-danger="true"
        @confirm="confirmRestore"
        @cancel="discardDraft" />
  </div>
</template>

<script setup>
import FullCharacterListCraft from "@/components/craft/list/FullCharacterList.vue";
import PreviewPdf from "@/components/craft/pdf/preview/PreviewPdf.vue";
import ButtonPanel from "@/components/craft/pdf/ButtonPanel.vue";
import ResultGenerator from "@/components/craft/pdf/print/ResultGenerator.vue";
import ScriptOptionsPopup from "@/components/craft/pdf/ScriptOptionsPopup.vue";
import {computed, ref, watch, onMounted, onUnmounted} from "vue";
import Spinner from "@/components/ui/Spinner.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {isEqualWithDefault} from "@/constants/other";
import {NPC_ROLES} from "@/constants/roles";
import {cloneDeep} from "lodash/lang";
import ScriptNightOrderPopup from "@/components/craft/pdf/ScriptNightOrderPopup.vue";
import BootleggerPopup from "@/components/craft/pdf/BootleggerPopup.vue";
import {
  saveDraft, loadDraft, deleteDraft, applyDraft,
  clearHistory, AUTOSAVE_INTERVAL, isUndoRedoInProgress
} from "@/store/craft/history";
import { skipDraftOnLeave } from "@/store/craft/state";
import {onBeforeRouteLeave, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";

defineOptions({
  name: 'edit-script'
})

const { locale } = useI18n()
const route = useRoute()
const craftStore = useCraftStore()
const { isOpenPdfOptions, isOpenNightOrder, isOpenBootlegger, isWaitingOperation, pdfListWithParams, pdfMeta, isEditingScript, activeScriptIndex, activeVersion, activeScript, isSavedScript } = storeToRefs(craftStore)
const elems = ref({})

// Draft restore state
const isShowRestoreDialog = ref(false)
const draftInfo = ref(null)
const pendingAction = ref(null) // { type: 'open' | 'create', data: any }

// Autosave interval
let autosaveInterval = null

// Flag to skip edit check after intentional state reset (save/discard)
const skipNextEditCheck = ref(false)

const isBootleggersEnabled = computed(() => {
  return NPC_ROLES.some(role => pdfListWithParams.value[role]?.find(el => el.id === 'bootlegger'))
})

// Format draft date for display
function formatDraftDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Check for saved draft on mount
async function checkForDraft() {
  const draft = await loadDraft()
  if (draft && draft.current) {
    // If restoreDraft query param is set, restore immediately without dialog
    if (route.query.restoreDraft === 'true') {
      // Don't restore activeScriptIndex/activeVersion - draft is independent
      // The script/version association will be determined on save based on pdfMeta.name
      applyDraft(draft)
      craftStore.recalculateCharacterList()
      // Force isEditingScript after watch cycle completes
      setTimeout(() => {
        isEditingScript.value = true
      }, 0)
    } else {
      // Show dialog - user can choose to restore draft or continue with current script
      draftInfo.value = draft
      isShowRestoreDialog.value = true
    }
  } else {
    // No draft found - clear history and start fresh
    clearHistory()
    elems.value = cloneDeep(pdfListWithParams.value)
  }
}

// Restore draft
function confirmRestore() {
  if (draftInfo.value) {
    applyDraft(draftInfo.value)
    craftStore.recalculateCharacterList()
    elems.value = cloneDeep(pdfListWithParams.value)
    // Force isEditingScript after watch cycle completes
    setTimeout(() => {
      isEditingScript.value = true
    }, 0)
  }
  isShowRestoreDialog.value = false
  draftInfo.value = null
}

// Discard draft and continue with current action
async function discardDraft() {
  await deleteDraft()
  clearHistory()
  elems.value = cloneDeep(pdfListWithParams.value)
  isShowRestoreDialog.value = false
  draftInfo.value = null
  // Skip next watch check and force isEditingScript to false
  skipNextEditCheck.value = true
  isEditingScript.value = false
}

// Save or delete draft before leaving
async function saveSessionIfNeeded() {
  // Skip if already handled by handleToScriptList
  if (skipDraftOnLeave.value) {
    skipDraftOnLeave.value = false
    return
  }

  if (isEditingScript.value) {
    // Unsaved changes - save draft
    await saveDraft({
      name: pdfMeta.value?.name || null
    })
  } else {
    // Changes are saved - delete draft if exists
    await deleteDraft()
  }
}

// Watch for changes
watch(pdfListWithParams, (val) => {
  if(Object.keys(elems.value).length === 0){
    elems.value = cloneDeep(val)
  }

  // Skip if undo/redo is in progress
  if (isUndoRedoInProgress.value) {
    return
  }

  // Skip if state was just reset (save/discard)
  if (skipNextEditCheck.value) {
    skipNextEditCheck.value = false
    return
  }

  isEditingScript.value = !isEqualWithDefault(pdfListWithParams.value, elems.value)
}, {immediate: true})

watch(isEditingScript, (value, oldValue) => {
  if(oldValue && !value){
    // When going from editing to not editing (save), sync elems
    skipNextEditCheck.value = true
    elems.value = cloneDeep(pdfListWithParams.value)
  }
})

// Lifecycle hooks
onMounted(() => {
  // Check for saved draft (will also clear history if no draft found)
  checkForDraft()

  // Start autosave interval
  autosaveInterval = setInterval(() => {
    if (isEditingScript.value) {
      saveDraft({
        name: pdfMeta.value?.name || null
      })
    }
  }, AUTOSAVE_INTERVAL)
})

onUnmounted(() => {
  // Clear autosave interval
  if (autosaveInterval) {
    clearInterval(autosaveInterval)
  }
})

// Save session before leaving the page
onBeforeRouteLeave(async (to, from, next) => {
  await saveSessionIfNeeded()
  next()
})
</script>