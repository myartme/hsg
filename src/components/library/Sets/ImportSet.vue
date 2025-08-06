<template>
  <sector-container
      :name="instance?.type.name"
      :is-show-sticky="isCanSave && isFullData">
    <template #sticky>
      <action-button v-if="issetImportContent"
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
      <import-set-tooltip />
    </template>
    <template #content>
      <div class="resize-none">
        <div class="mb-2">
          <drag-and-drop
              text="Click to choose a JSON file / drag a JSON file here<br>or paste it manually into the field below"
              @json-loaded="loadedContent" />
        </div>
        <div class="relative flex mb-2 overflow-auto max-h-160">
          <JsonEditorVue
              :class="[
              'border-2 rounded-md w-full focus:outline-none shadow-sm border-[color:var(--color-border)]',
              { 'jse-theme-dark': theme === themes?.dark }
          ]"
              v-model="importContent"
              :onChange="textareaValueChange"
              mode="text"
              :readOnly="false"
              :indentation="4"
              :navigationBar="false"
              :mainMenuBar="false"
              :statusBar="false"
              :askToFormat="false"
              :askToRepair="false"
          />
        </div>
        <import-table-info :error-list="errorList" :chars-list="charsList" />
      </div>
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
import {EMPTY_CHARACTER, EMPTY_SET, MAIN_ROLES, ROLES} from "@/constants/roles";
import SectorContainer from "@/components/SectorContainer.vue";
import {storeToRefs} from "pinia";
import { useLibraryStore } from "@/store/library";
import {useIndexStore} from "@/store";
import {isEmpty, isEqual} from "lodash/lang";
import {
  DEFAULT_ACTION_BUTTON_ACTIVE_TIME, getImageArray,
  getImageFirstUrl,
  objectToPrettyJson,
  toNormalizeString
} from "@/constants/other";
import ImportTableInfo from "@/components/ui/ImportTableInfo.vue";
import JsonEditorVue from "json-editor-vue";
import {useOptionsStore} from "@/store/options";
import DragAndDrop from "@/components/ui/DragAndDrop.vue";
import ImportSetTooltip from "@/components/library/Sets/ImportSetTooltip.vue";

defineOptions({
  name: 'import-set'
})

const props = defineProps({
  label: String
})

const instance = getCurrentInstance()
const indexStore = useIndexStore()
const libraryStore = useLibraryStore()
const { metaSets, activeSetIndex, allListsAsOne } = storeToRefs(libraryStore)
const optionsStore = useOptionsStore()
const { theme, themes } = storeToRefs(optionsStore)
const meta = ref({ ...EMPTY_SET })
const list = ref({})
const importContent = ref("")
const charsList = ref({})
const errorList = ref([])
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

const issetImportContent = computed(() =>
    Object.values(charsList.value).reduce((sum, role) => sum + role.length, 0) > 0
)

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

function textareaValueChange({ text }){
  try{
    const jsonContent = JSON.parse(text)
    formalizedMeta(jsonContent)
    formalizedList(jsonContent)
  } catch (e){
    formalizedMeta({})
    formalizedList({})
  }
}

function loadedContent(value){
  importContent.value = value
  textareaValueChange({ text: value })
}

function formalizedMeta(content){
  meta.value = {...EMPTY_SET}
  if(!isEmpty(content)){
    const foundMeta = content.find(el => el.id === '_set')
    if(!!meta){
      meta.value = {...meta.value, ...foundMeta}
      meta.value.id = toNormalizeString(meta.value.name)
    }
  }
}

function formalizedList(content){
  charsList.value = {}
  errorList.value = []
  if(!isEmpty(content)){
    const list = content.filter(el => el.id !== '_set');
    charsList.value = ROLES.reduce((acc, role) => {
      acc[role] = list
          .filter(el => el.team === role)
          .map(el =>
              ({
                ...EMPTY_CHARACTER,
                ...el,
                id: toNormalizeString(`${el.name}_${meta.value.id}`, 30),
                edition: toNormalizeString(`${meta.value.id}`, 50),
                image: getImageArray(el.image || [], el.team),
                jinxes: getJinxes(el)
              })
          )
      return acc;
    }, {});
    for (const item of list) {
      if (!item.team || !item.ability || !item.name) {
        let missingFields = []
        if(!item.name) {
          missingFields.push("<strong>name</strong>")
        }
        if(!item.team) {
          missingFields.push("<strong>team</strong>")
        }
        if(!item.ability) {
          missingFields.push("<strong>ability</strong>")
        }
        const fields = missingFields.join(", ")
        addNewError(`Required field(s) ${fields} not found in record ${objectToPrettyJson(item)}`)
      }

      if(item.team){
        const teamExists = ROLES.some(role => {
          return role === item.team
        })
        if (!teamExists) {
          addNewError(`Unknown team <strong>${item.team}</strong> in record ${objectToPrettyJson(item)}`)
        }
      }
    }
  }
}

function getJinxes(element){
  const jinxes = element?.jinxes
  if(!jinxes) return []
  return jinxes.map(jinx => {
    const found = MAIN_ROLES.map(type => allListsAsOne.value[type].find(role => role.id === jinx.id)).find(Boolean);
    if (found){
      return {
        id: jinx.id,
        reason: jinx.reason,
        image: getImageFirstUrl(found),
        name: found.name,
        ability: found.ability
      }
    } else {
      addNewError(`Jinx of <strong>${element.name}</strong> will be ignored: character with id <strong>${jinx.id}</strong> not found.`);
      return null
    }
  }).filter(Boolean)
}

function addNewError(message){
  errorList.value.push(message)
}

function save(){
  try{
    libraryStore.saveNewMetaAndList({ ...meta.value }, { ...charsList.value })
    setTimeout(() => {
      isCanSave.value = false
      indexStore.unfocusWindow()
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

function undo(){
  try{
    importContent.value = ""
    meta.value = getEmptyValue()
    charsList.value = {}
    errorList.value = []
    setTimeout(() => {
      isCanSave.value = false
      indexStore.unfocusWindow()
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
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