<template>
  <sector-container
      :name="instance?.type.name"
      :is-show-sticky="isCanSave">
    <template #sticky>
      <action-button v-if="issetImportContent"
                     icon="save"
                     icon-size="w-6 h-6"
                     button-class="w-10 h-10"
                     :handle="save" />
      <action-button icon="undo"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     :handle="undo" />
    </template>
    <template #header>
      <h2 class="text-2xl font-bold">Import Characters</h2>
      <import-character-tooltip />
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
                  'border-2 rounded-md w-full focus:outline-none shadow-sm border-[color:var(--color:border)]',
                  { 'jse-theme-dark' : theme === themes?.dark }
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
    </template>
  </sector-container>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import {EMPTY_CHARACTER, MAIN_ROLES, ROLES, stripDefaults} from "@/constants/roles.js";
import SectorContainer from "@/components/SectorContainer.vue";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, getImageArray, getImageFirstUrl, objectToPrettyJson, toNormalizeString} from "@/constants/other";
import { useLibraryStore } from "@/store/library";
import { storeToRefs } from "pinia";
import {isArray, isEmpty, isEqual} from "lodash/lang";
import JsonEditorVue from "json-editor-vue";
import {useOptionsStore} from "@/store/options";
import ImportTableInfo from "@/components/ui/ImportTableInfo.vue";
import DragAndDrop from "@/components/ui/DragAndDrop.vue";
import {useIndexStore} from "@/store";
import ImportCharacterTooltip from "@/components/library/RoleEditor/ImportCharacterTooltip.vue";

defineOptions({
  name: 'import-form'
})

const instance = getCurrentInstance()
const indexStore = useIndexStore()
const libraryStore = useLibraryStore()
const optionsStore = useOptionsStore()
const { theme, themes } = storeToRefs(optionsStore)
const { activeMeta, activeList, allListsAsOne } = storeToRefs(libraryStore)
const charsList = ref({})
const importContent = ref("")
const errorList = ref([])
const isCanSaveChar = ref(false)
const emits = defineEmits(['createRole'])

const isCanSave = computed({
  get: () => isCanSaveChar.value,
  set: (val) => {
    isCanSaveChar.value = val
  }
})

const issetImportContent = computed(() =>
    Object.values(charsList.value).reduce((sum, role) => sum + role.length, 0) > 0
)

function textareaValueChange({ text }){
  try{
    const jsonContent = JSON.parse(text)
    formalizedList(jsonContent)
  } catch (e){
    formalizedList({})
  }
}

function loadedContent(value){
  importContent.value = value
  textareaValueChange({ text: value })
}

function formalizedList(content){
  charsList.value = {}
  errorList.value = []
  if(!isEmpty(content)){
    const normalizedContent = isArray(content) ? content : [content];
    const list = normalizedContent.filter(el => el.id !== '_meta');
    charsList.value = ROLES.reduce((acc, role) => {
      acc[role] = list
          .filter(listElement => listElement.team === role)
          .filter(listElement => {
            const duplicate = activeList.value[role].some(el =>
                el.name === listElement.name
            );

            if (duplicate) {
              addNewError(`There is already a character with name <strong>${listElement.name}</strong>`);
              return false
            }

            return true
          })
          .map(listElement =>
            (stripDefaults(
                {
                  ...EMPTY_CHARACTER,
                  ...listElement,
                  id: toNormalizeString(`${listElement.name}_${activeMeta.value.id}`, 30),
                  edition: toNormalizeString(`${activeMeta.value.id}`, 50),
                  image: getImageArray(listElement.image || [], listElement.team),
                  jinxes: getJinxes(listElement)
                }, EMPTY_CHARACTER))
          )
        return acc
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

function addNewError(message){
  errorList.value.push(message)
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

function save(){
  try{
    libraryStore.saveCharactersToList(charsList.value)
    emits('createRole')
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

watch(charsList, () => {
  isCanSave.value = !isEqual(charsList.value, {})
})

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>