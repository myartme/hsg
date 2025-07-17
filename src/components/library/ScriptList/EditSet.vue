<template>
  <sector-container
      :name="instance?.type.name"
      :is-show-sticky="isCanSave && isFullData">
    <template #sticky>
      <action-button
          icon="save"
          icon-size="w-6 h-6"
          button-class="w-10 h-10"
          :handle="save" />
      <action-button v-if="activeSetIndex > 0"
          icon="undo"
          icon-size="w-7 h-7"
          button-class="w-10 h-10"
          :handle="undo" />
    </template>
    <template #header>
      <h2 class="text-2xl font-bold text-[color:var(--color-title-text)]">{{ label }}</h2>
      <action-button v-if="activeSetIndex > 0"
                     icon="delete"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     tooltip="Delete this set"
                     :is-show-effect="false"
                     @click="isVisibleDeleteDialog = true" />
    </template>
    <template #content>
      <simple-input
          @input="addId"
          v-model:value="meta.id"
          label="ID"
          :maxlength="30"
          :errored="isVisibleError"
          required="This field is required."
          :disabled="activeSetIndex >= 0"
          error-text="There is already a set with this ID in your library"
          class="mb-2" />
      <simple-input
          v-model:value="meta.name"
          label="Name"
          :maxlength="50"
          required="This field is required."
          :disabled="activeSetIndex >= 0"
          class="mb-2" />
      <simple-input
          v-model:value="meta.author"
          label="Author"
          :maxlength="50"
          required="This field is required."
          class="mb-2" />
      <simple-input
          v-model:value="meta.logo"
          label="Logo"
          :maxlength="250"
          class="mb-2" />
      <img
          v-if="meta.logo"
          :src="meta.logo"
          class="mt-10 h-50 object-cover rounded mx-auto"
          alt="logo" />
      <confirm-dialog v-if="isVisibleDeleteDialog"
                      :title="`Deleting ${meta.name}`"
                      description="This action cannot be undone. Are you sure you want to delete this set?"
                      @confirm="remove"
                      @cancel="isVisibleDeleteDialog = false" />
    </template>
  </sector-container>
</template>
<script setup>
import {computed, getCurrentInstance, ref, watch} from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import { EMPTY_SET } from "@/constants/roles";
import SectorContainer from "@/components/SectorContainer.vue";
import {storeToRefs} from "pinia";
import { useLibraryStore } from "@/store/library";
import {isEqual} from "lodash/lang";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, toNormalizeString} from "@/constants/other";
import {useIndexStore} from "@/store";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";

defineOptions({
  name: 'edit-set'
})

const props = defineProps({
  label: String
})

const instance = getCurrentInstance()
const indexStore = useIndexStore()
const libraryStore = useLibraryStore()
const { activeMeta, metaSets, activeSetIndex } = storeToRefs(libraryStore)
const meta = ref({})
const isVisibleError = ref(false)
const isVisibleDeleteDialog = ref(false)
const isCanSave = ref(false)

const isFullData = computed(() => {
  return !isVisibleError.value &&
      meta.value.id !== '' &&
      meta.value.name !== '' &&
      meta.value.author !== ''
})

const getEmptyValue = () => ({ ...EMPTY_SET })
const getDefaultValue = () => ({ ...EMPTY_SET, ...activeMeta.value })

function addId(event){
  const value = toNormalizeString(event.target.value)
  const idx = metaSets.value.findIndex(el => el.id === event.target.value)
  if(idx !== -1){
    if(idx !== activeSetIndex.value){
      isVisibleError.value = true
      return
    }
  }

  isVisibleError.value = false
  if(isFullData.value){
    isCanSave.value = true
  }
  meta.value.id = value
}

function save(){
  try{
    if(activeSetIndex.value < 0){
      libraryStore.saveNewMetaAndList({ ...meta.value })
    } else {
      libraryStore.saveActiveSetWithMeta({ ...meta.value })
    }
    isCanSave.value = false
    indexStore.unfocusWindow()
    return true
  } catch (e){
    return false
  }
}

function undo(){
  try{
    meta.value = getDefaultValue()
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

function remove(){
  isVisibleDeleteDialog.value = false
  libraryStore.deleteSet(meta.value.id)
}

watch(activeSetIndex, (newVal) => {
    meta.value = newVal === -1 ? getEmptyValue() : getDefaultValue()
}, { immediate: true })

watch(meta, (newVal) => {
  isCanSave.value = !isEqual(newVal, getDefaultValue())
}, { deep: true })

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>