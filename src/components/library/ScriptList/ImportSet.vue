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
      <action-button
         icon="undo"
         icon-size="w-7 h-7"
         button-class="w-10 h-10"
         :handle="undo" />
    </template>
    <template #header>
      <h2 class="text-2xl font-bold">{{ label }}</h2>
    </template>
    <template #content>
      <import-set-textarea
          :value="importContent"
          @create-meta="setMeta"
          @create-list="list = $event" />
      <simple-input
          v-if="activeSetIndex < 0"
          @input="addId"
          v-model:value="meta.id"
          label="ID"
          :maxlength="30"
          :errored="isVisibleError"
          required="This field is required."
          :disabled="isOfficial || activeSetIndex >= 0"
          error-text="There is already a set with this ID in your library"
          class="mb-2" />
      <simple-input
          v-if="activeSetIndex < 0"
          v-model:value="meta.name"
          label="Name"
          :maxlength="50"
          required="This field is required."
          :disabled="isOfficial || activeSetIndex >= 0"
          class="mb-2" />
      <simple-input
          v-model:value="meta.author"
          label="Author"
          :maxlength="50"
          required="This field is required."
          :disabled="isOfficial"
          class="mb-2" />
      <simple-input
          v-model:value="meta.logo"
          label="Logo"
          :maxlength="250"
          :disabled="isOfficial"
          class="mb-2" />
      <img
          v-if="meta.logo"
          class="mt-10 h-50 object-cover rounded mx-auto"
          :src="meta.logo"
          alt="logo" />
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
import {useIndexStore} from "@/store";
import {isEqual} from "lodash/lang";
import {toNormalizeString} from "@/constants/other";
import ImportSetTextarea from "@/components/library/ScriptList/ImportSetTextarea.vue";

defineOptions({
  name: 'import-set'
})

const props = defineProps({
  label: String
})

const instance = getCurrentInstance()
const indexStore = useIndexStore()
const libraryStore = useLibraryStore()
const { metaSets, activeSetIndex } = storeToRefs(libraryStore)
const meta = ref({ ...EMPTY_SET })
const list = ref({})
const importContent = ref("")
const isVisibleError = ref(false)
const isCanSave = ref(false)

const isFullData = computed(() => {
  return !isVisibleError.value &&
      !!meta.value.id &&
      !!meta.value.name &&
      !!meta.value.author
})

const getEmptyValue = () => ({ ...EMPTY_SET })

const isOfficial = computed(() => {
  return meta.value.isOfficial ?? false
})

function addId(event){
  const value = event.target?.value ? toNormalizeString(event.target.value) : toNormalizeString(event)
  const idx = metaSets.value.findIndex(el => el.id === value)
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

function setMeta(event){
  meta.value = Object.fromEntries(
      Object.entries(EMPTY_SET).map(([key, value]) => [
        key,
        key in event ? event[key] : value
      ])
  );
  if(!meta.value?.id) return

  addId(meta.value.id)
}

function save(){
  try{
    libraryStore.saveNewMetaAndList({ ...meta.value }, { ...list.value })
    isCanSave.value = false
    indexStore.unfocusWindow()
    return true
  } catch (e){
    return false
  }
}

function undo(){
  try{
    meta.value = { ...EMPTY_SET }
    list.value = {}
    importContent.value = ""
    isCanSave.value = false
    indexStore.unfocusWindow()
    return true
  } catch (e){
    return false
  }
}

watch(meta, (newVal) => {
  isCanSave.value = !isEqual(newVal, getEmptyValue())
}, { deep: true })

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>