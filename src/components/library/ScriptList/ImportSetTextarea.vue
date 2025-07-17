<template>
  <div class="resize-none">
    <div class="flex items-center space-x-1 mb-1">
      <label class="text-lg block font-semibold mb-1 title-theme">Import Content</label>
      <info-tooltip class="mb-1" icon-size="w-5 h-5" text="You can import set and one or more characters. Required fields for a character: &quot;name&quot;, &quot;team&quot;, &quot;ability&quot;.
      <br>Parameters that can be processed:
      <br>{
      <br>&nbsp;&nbsp;&quot;<strong>id</strong>&quot;: &quot;_meta&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>name</strong>&quot;: &quot;name&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>author</strong>&quot;: &quot;author&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>logo</strong>&quot;: &quot;logo&quot;
      <br>}
      <br>{
      <br>&nbsp;&nbsp;&quot;<strong>id</strong>&quot;: &quot;id&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>name</strong>&quot;: &quot;name&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>team</strong>&quot;: &quot;team&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>ability</strong>&quot;: &quot;ability&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>image</strong>&quot;: [up to 3 elements]
      <br>&nbsp;&nbsp;(or &quot;<strong>image</strong>&quot;: &quot;image&quot;),
      <br>&nbsp;&nbsp;&quot;<strong>setup</strong>&quot;: true/false,
      <br>&nbsp;&nbsp;&quot;<strong>firstNight</strong>&quot;: 0,
      <br>&nbsp;&nbsp;&quot;<strong>firstNightReminder</strong>&quot;: &quot;reminder&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>otherNight</strong>&quot;: 0,
      <br>&nbsp;&nbsp;&quot;<strong>otherNightReminder</strong>&quot;: &quot;reminder&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>flavor</strong>&quot;: &quot;flavor&quot;,
      <br>&nbsp;&nbsp;&quot;<strong>reminders</strong>&quot;: [up to 20 elements],
      <br>&nbsp;&nbsp;&quot;<strong>remindersGlobal</strong>&quot;: [up to 20 elements],
      <br>&nbsp;&nbsp;&quot;<strong>jinxes</strong>&quot;: [{id:&quot;&quot;, reason:&quot;&quot;} (any number of elements )]
      <br>}" />
    </div>
    <div class="relative flex mb-2 overflow-auto max-h-160">
      <JsonEditorVue
          :class="[
              'border-2 rounded-md w-full focus:outline-none shadow-sm border-[color:var(--color-border)]',
              { 'jse-theme-dark': theme === themes?.dark }
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
import InfoTooltip from "@/components/ui/InfoTooltip.vue"
import JsonEditorVue from 'json-editor-vue'
import {ref, watch} from "vue";
import {getImageFirstUrl, toNormalizeString} from "@/constants/other";
import {EMPTY_CHARACTER, EMPTY_SET, MAIN_ROLES, ROLES} from "@/constants/roles";
import {isEmpty} from "lodash/lang";
import {useLibraryStore} from "@/store/library";
import {storeToRefs} from "pinia";
import ImportTableInfo from "@/components/ui/ImportTableInfo.vue";
import {useOptionsStore} from "@/store/options";

const props = defineProps({
  label: String,
  value: String,
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
const { allListsAsOne } = storeToRefs(libraryStore)
const optionsStore = useOptionsStore()
const { theme, themes } = storeToRefs(optionsStore)

const textareaValue = ref(props.value)
const charsList = ref({})
const errorList = ref([])
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
  meta.value = {...EMPTY_SET}
  if(!isEmpty(content)){
   const foundMeta = content.find(el => el.id === '_meta')
    if(!!meta){
      meta.value = {...meta.value, ...foundMeta}
      meta.value.id = toNormalizeString(meta.value.name)
    }
  }

  emits('createMeta', meta.value)
}

function formalizedList(content){
  charsList.value = {}
  errorList.value = []
  if(!isEmpty(content)){
    const list = content.filter(el => el.id !== '_meta');
    charsList.value = ROLES.reduce((acc, role) => {
      acc[role] = list
          .filter(el => el.team === role)
          .map(el =>
              ({
                ...EMPTY_CHARACTER,
                ...el,
                id: toNormalizeString(`${el.name}_${meta.value.id}`, 30),
                edition: toNormalizeString(`${meta.value.id}`, 50),
                jinxes: getJinxes(el)
              })
          )
      return acc;
    }, {});
  }
  emits('createList', charsList.value)
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

watch(() => props.value, (newVal) => {
  textareaValue.value = newVal
})
</script>