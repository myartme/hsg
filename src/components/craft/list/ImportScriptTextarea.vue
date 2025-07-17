<template>
  <div class="resize-none">
    <div class="flex items-center space-x-1 mb-1">
      <label class="text-lg block font-semibold mb-1 title-theme">Import Script</label>
    </div>
    <div class="relative flex mb-2 overflow-auto max-h-160">
      <JsonEditorVue
          :class="[
              'border-2 rounded-md w-full border-[color:var(--color-border)]',
              { 'jse-theme-dark' : theme === themes?.dark }
          ]"
          v-model="textareaValue"
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
<script setup>
import JsonEditorVue from 'json-editor-vue'
import {ref} from "vue";
import {EMPTY_IMPORT_SCRIPT, ROLES} from "@/constants/roles";
import {isEmpty} from "lodash/lang";
import {useLibraryStore} from "@/store/library";
import {storeToRefs} from "pinia";
import ImportTableInfo from "@/components/ui/ImportTableInfo.vue";
import {useOptionsStore} from "@/store/options";

const props = defineProps({
  label: String,
  maxlength: {
    type: Number,
    default: 50000
  },
  tooltip: String,
  disabled: {
    type: Boolean,
    default: false
  }
})

const libraryStore = useLibraryStore()
const optionsStore = useOptionsStore()
const { allListsAsOne } = storeToRefs(libraryStore)
const { theme, themes } = storeToRefs(optionsStore)
const defaultTeams = () => {
  return ROLES.reduce((acc, role) => {
    acc[role] = 0
    return acc
  }, {})
}
const textareaValue = ref(props.value)
const charsList = ref({})
const errorList = ref([])
const teams = ref(defaultTeams())
const meta = ref({})
const emits = defineEmits(['createMeta', 'createList'])

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

function formalizedMeta(content){
  meta.value = {...EMPTY_IMPORT_SCRIPT}
  if(!isEmpty(content)){
    const foundMeta = content.find(el => el.id === '_meta')
    if(!!meta){
      meta.value = {...meta.value, ...foundMeta}
    }
  }
  emits('createMeta', meta.value)
}

function formalizedList(content){
  charsList.value = {}
  errorList.value = []
  teams.value = defaultTeams()
  if(!isEmpty(content)){
    const list = content.filter(el => el.id !== '_meta');
    charsList.value = list.map(element => {
      const id = element?.id ? element.id.replace(/[\s_]+/g, '') : element.replace(/[\s_]+/g, '')
      const finder = Object.values(allListsAsOne.value).flat().find(el => {
        return el.id === id
      })
      if(finder){
        teams.value[finder.team] = teams.value[finder.team] + 1
        return element
      } else {
        addNewError(`Character with id <strong>${id}</strong> not found in your library.`);
        return null
      }
    }).filter(Boolean)
  }
  emits('createList', charsList.value)
}

function addNewError(message){
  errorList.value.push(message)
}
</script>