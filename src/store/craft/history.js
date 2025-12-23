import { ref, computed, toRaw } from 'vue'
import { cloneDeep } from 'lodash/lang'
import { pdfMeta, pdfListWithParams, characterListWithParams, isDraftRestored, hasSavedDraft } from './state'

// Constants
const MAX_HISTORY = 50
const AUTOSAVE_INTERVAL = 60000 // 60 seconds

// State
const history = ref([])       // stack of past states
const future = ref([])        // stack for redo
const isUndoRedo = ref(false) // flag to ignore watchers during undo/redo

// Computed
export const canUndo = computed(() => history.value.length > 0)
export const canRedo = computed(() => future.value.length > 0)
export const isUndoRedoInProgress = computed(() => isUndoRedo.value)

// History list for UI: future (redo) + current + history (undo)
export const historyList = computed(() => {
  const current = {
    meta: pdfMeta.value,
    list: pdfListWithParams.value,
    charList: characterListWithParams.value,
    timestamp: Date.now(),
    isCurrent: true
  }

  // Future items (can redo to these) - reversed so newest is first
  const futureItems = future.value.slice().reverse().map(item => ({
    ...item,
    isFuture: true
  }))

  // History items (can undo to these) - reversed so newest is first
  const historyItems = history.value.slice().reverse()

  // Order: future (top) → current → history (bottom)
  return [...futureItems, current, ...historyItems]
})

// Index of current state in historyList
export const currentIndex = computed(() => future.value.length)

// Action types for history
export const ACTION_TYPES = {
  ADD_CHARACTER: 'addCharacter',
  REMOVE_CHARACTER: 'removeCharacter',
  CHANGE_NAME: 'changeName',
  CHANGE_AUTHOR: 'changeAuthor',
  CHANGE_ALMANAC: 'changeAlmanac',
  CHANGE_LOGO: 'changeLogo',
  ADD_BOOTLEGGER_RULE: 'addBootleggerRule',
  REMOVE_BOOTLEGGER_RULE: 'removeBootleggerRule',
  CHANGE_NIGHT_ORDER: 'changeNightOrder',
  CHANGE_VERSION: 'changeVersion',
  UNKNOWN: 'unknown'
}

/**
 * Create a snapshot of current state
 * @param {string} actionType - type of action (from ACTION_TYPES)
 * @param {string} actionValue - related value (character name, script name, etc.)
 */
export function createSnapshot(actionType = ACTION_TYPES.UNKNOWN, actionValue = '') {
  return {
    meta: cloneDeep(toRaw(pdfMeta.value)),
    list: cloneDeep(toRaw(pdfListWithParams.value)),
    charList: cloneDeep(toRaw(characterListWithParams.value)),
    timestamp: Date.now(),
    actionType,
    actionValue
  }
}

/**
 * Push current state to history before making changes
 * Call this BEFORE modifying pdfMeta or pdfListWithParams
 * @param {string} actionType - type of action (from ACTION_TYPES)
 * @param {string} actionValue - related value (character name, script name, etc.)
 */
export function pushState(actionType = ACTION_TYPES.UNKNOWN, actionValue = '') {
  if (isUndoRedo.value) return

  const snapshot = createSnapshot(actionType, actionValue)
  history.value.push(snapshot)

  // Limit history size
  if (history.value.length > MAX_HISTORY) {
    history.value.shift()
  }

  // Clear future on new action
  future.value = []
}

/**
 * Undo last action
 * @returns {boolean} true if undo was performed
 */
export function undo() {
  if (history.value.length === 0) return false

  isUndoRedo.value = true
  try {
    // Get the action info from history item we're undoing
    const prev = history.value.pop()

    // Save current state to future with the action info (so redo shows what was undone)
    const currentSnapshot = {
      meta: cloneDeep(toRaw(pdfMeta.value)),
      list: cloneDeep(toRaw(pdfListWithParams.value)),
      charList: cloneDeep(toRaw(characterListWithParams.value)),
      timestamp: Date.now(),
      actionType: prev.actionType,
      actionValue: prev.actionValue
    }
    future.value.push(currentSnapshot)

    // Restore previous state
    pdfMeta.value = prev.meta
    pdfListWithParams.value = prev.list
    if (prev.charList) {
      characterListWithParams.value = prev.charList
    }

    return true
  } finally {
    isUndoRedo.value = false
  }
}

/**
 * Redo last undone action
 * @returns {boolean} true if redo was performed
 */
export function redo() {
  if (future.value.length === 0) return false

  isUndoRedo.value = true
  try {
    // Get the action info from future item we're redoing
    const next = future.value.pop()

    // Save current state to history with the action info
    const currentSnapshot = {
      meta: cloneDeep(toRaw(pdfMeta.value)),
      list: cloneDeep(toRaw(pdfListWithParams.value)),
      charList: cloneDeep(toRaw(characterListWithParams.value)),
      timestamp: Date.now(),
      actionType: next.actionType,
      actionValue: next.actionValue
    }
    history.value.push(currentSnapshot)

    // Restore from future
    pdfMeta.value = next.meta
    pdfListWithParams.value = next.list
    if (next.charList) {
      characterListWithParams.value = next.charList
    }

    return true
  } finally {
    isUndoRedo.value = false
  }
}

/**
 * Go to a specific index in historyList
 * @param {number} targetIndex - index in historyList (0 = newest future, currentIndex = current, > currentIndex = history)
 * @returns {boolean} true if navigation was performed
 */
export function goToHistoryStep(targetIndex) {
  const currIdx = future.value.length // current position in list

  if (targetIndex === currIdx) return false // already at current
  if (targetIndex < 0) return false
  if (targetIndex > currIdx + history.value.length) return false

  if (targetIndex < currIdx) {
    // Go forward (redo) - targetIndex is in future
    const redoCount = currIdx - targetIndex
    for (let i = 0; i < redoCount; i++) {
      redo()
    }
    return true
  } else {
    // Go back (undo) - targetIndex is in history
    const undoCount = targetIndex - currIdx
    for (let i = 0; i < undoCount; i++) {
      undo()
    }
    return true
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  history.value = []
  future.value = []
}

/**
 * Restore history from saved draft
 */
export function restoreHistory(savedHistory, savedFuture) {
  history.value = savedHistory || []
  future.value = savedFuture || []
}

/**
 * Get current history and future for saving
 */
export function getHistoryState() {
  return {
    history: cloneDeep(toRaw(history.value)),
    future: cloneDeep(toRaw(future.value))
  }
}

// ============ Draft (Session) Management ============

/**
 * Save current session to file
 * @param {Object} scriptInfo - { name, version } of current script
 */
export async function saveDraft(scriptInfo = {}) {
  const draft = {
    version: 1,
    timestamp: Date.now(),
    scriptName: scriptInfo.name || null,
    scriptVersion: scriptInfo.version || null,
    current: {
      meta: cloneDeep(toRaw(pdfMeta.value)),
      list: cloneDeep(toRaw(pdfListWithParams.value)),
      charList: cloneDeep(toRaw(characterListWithParams.value))
    },
    ...getHistoryState()
  }

  try {
    const content = JSON.stringify(draft, null, 2)
    await window.electronAPI.saveDraft(content)
    hasSavedDraft.value = true
    return true
  } catch (error) {
    console.error('Failed to save draft:', error)
    return false
  }
}

/**
 * Load saved session from file
 * @returns {Object|null} draft data or null if not found
 */
export async function loadDraft() {
  try {
    const response = await window.electronAPI.loadDraft()
    if (response?.isSuccess && response.content) {
      const draft = typeof response.content === 'string'
        ? JSON.parse(response.content)
        : response.content
      return draft
    }
  } catch (error) {
    console.error('Failed to load draft:', error)
  }
  return null
}

/**
 * Delete saved session file
 */
export async function deleteDraft() {
  try {
    const response = await window.electronAPI.deleteDraft()
    if (response?.isSuccess) {
      hasSavedDraft.value = false
      return true
    } else {
      // File doesn't exist - consider it "deleted"
      if (response?.error?.code === 'ENOENT') {
        hasSavedDraft.value = false
        return true
      }
      console.error('Failed to delete draft:', response?.error)
      return false
    }
  } catch (error) {
    console.error('Failed to delete draft:', error)
    return false
  }
}

/**
 * Check if draft exists and update global flag
 * @returns {boolean}
 */
export async function checkDraftExists() {
  const draft = await loadDraft()
  hasSavedDraft.value = draft !== null
  return hasSavedDraft.value
}

/**
 * Apply draft to current state
 * @param {Object} draft - saved draft data
 */
export function applyDraft(draft) {
  if (!draft || !draft.current) return false

  isUndoRedo.value = true
  try {
    // Set flag FIRST to prevent watch from overwriting characterListWithParams
    isDraftRestored.value = true

    pdfMeta.value = draft.current.meta
    pdfListWithParams.value = draft.current.list
    // DON'T restore characterListWithParams from draft - it should be recalculated
    // based on CURRENT filter settings (enabled sets), not the settings at draft save time

    restoreHistory(draft.history, draft.future)
    return true
  } finally {
    isUndoRedo.value = false
  }
}

// Export constants for external use
export { AUTOSAVE_INTERVAL }
