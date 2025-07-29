<template>
  <sector-container
      :name="instance?.type.name"
      :is-show-sticky="isCanSave && isFullData">
    <template #sticky>
      <action-button v-if="isFullData"
          icon="save"
          icon-size="w-6 h-6"
          button-class="w-10 h-10"
          :handle="save">
      </action-button>
      <action-button v-if="isFullData"
          icon="undo"
          icon-size="w-7 h-7"
          button-class="w-10 h-10"
          :handle="undo" />
    </template>
    <template #header>
      <h2 class="text-2xl font-bold">{{ label }}</h2>
      <info-tooltip class="mb-1" icon-size="w-5 h-5" text="You can import script. Required fields: &quot;id&quot;, &quot;name&quot;.
            <br>Minimum requirements for the character in script:
            <br>&nbsp;&nbsp;&quot;character_id&quot;,
            <br>{
            <br>&nbsp;&nbsp;&quot;<strong>id</strong>&quot;: &quot;character_id&quot;,
            <br>}" />
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
              'border-2 rounded-md w-full border-[color:var(--color-border)]',
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
      <simple-input
          v-model:value="meta.name"
          label="Name"
          :maxlength="50"
          required="This field is required."
          class="mb-2" />
      <simple-input
          v-model:value="meta.author"
          label="Author"
          :maxlength="50"
          tooltip="Default version for this field is <b>Unknown</b>"
          class="mb-2" />
      <simple-input
          v-model:value="meta.almanac"
          label="Almanac"
          :maxlength="250"
          class="mb-2" />
      <simple-checkbox
          v-model:value="meta.hideTitle"
          label="Hide Title"
          tooltip="You can hide script's title." />
        <simple-input-tag
            v-model:value="meta.bootlegger"
            div-class="mt-2"
            label="Bootlegger rules"
            :max-tags="10"
            :maxlength="250"
            tooltip="Bootlegger rules for this script." />
      <simple-textarea
          v-model:value="meta.note"
          label="Note"
          :maxlength="5000"
          rows="6"
          class="mt-2"
          tooltip="Your custom notes." />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <simple-input
            v-model:value="meta.logo"
            label="Logo"
            :maxlength="250"
            class="mb-2" />
        <simple-input
            v-model:value="meta.background"
            label="Background"
            :maxlength="250"
            class="mb-2" />
        <img v-if="meta.logo" :src="meta.logo" class="mt-10 h-50 object-cover rounded mx-auto" alt="logo">
        <img v-if="meta.background" :src="meta.background" class="mt-10 h-50 object-cover rounded mx-auto" alt="background">
      </div>
    </template>
  </sector-container>
</template>
<script setup>
import {computed, getCurrentInstance, ref, watch} from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import { EMPTY_IMPORT_SCRIPT, ROLES} from "@/constants/roles";
import SectorContainer from "@/components/SectorContainer.vue";
import {useIndexStore} from "@/store";
import {isEmpty, isEqual} from "lodash/lang";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, SET_INDEX} from "@/constants/other";
import {useCraftStore} from "@/store/craft";
import SimpleInputTag from "@/components/ui/SimpleInputTag.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import {activeScriptIndex} from "@/store/craft/state";
import ImportTableInfo from "@/components/ui/ImportTableInfo.vue";
import JsonEditorVue from "json-editor-vue";
import {useLibraryStore} from "@/store/library";
import {useOptionsStore} from "@/store/options";
import {storeToRefs} from "pinia";
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
import DragAndDrop from "@/components/ui/DragAndDrop.vue";

defineOptions({
  name: 'import-script'
})

const props = defineProps({
  label: String
})

const libraryStore = useLibraryStore()
const optionsStore = useOptionsStore()
const { allListsAsOne } = storeToRefs(libraryStore)
const { theme, themes } = storeToRefs(optionsStore)
const instance = getCurrentInstance()
const craftStore = useCraftStore()
const indexStore = useIndexStore()
const importContent = ref("")
const charsList = ref({})
const errorList = ref([])
const meta = ref({})
const isVisibleError = ref(false)
const isCanSave = ref(false)

const isFullData = computed(() => {
  return !isVisibleError.value &&
      !!meta.value.id &&
      !!meta.value.name
})

const getEmptyValue = () => ({ ...EMPTY_IMPORT_SCRIPT })

function save(){
  try{
    craftStore.saveImportScript(meta.value, Object.values(charsList.value).flat())
    isCanSave.value = false
    indexStore.unfocusWindow()
    activeScriptIndex.value = SET_INDEX.DEFAULT
    return true
  } catch (e){
    return false
  }
}

function undo(){
  try{
    charsList.value = {}
    importContent.value = ""
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
  meta.value = {...EMPTY_IMPORT_SCRIPT}
  if(!isEmpty(content)){
    const foundMeta = content.find(el => el.id === '_meta')
    if(!!meta){
      meta.value = {...meta.value, ...foundMeta}
    }
  }
}

function formalizedList(content){
  charsList.value = {}
  errorList.value = []
  if(!isEmpty(content)){
    const localList = content.filter(el => el.id !== '_meta')

    const findCharacterById = (id, role = null) => {
      const pool = role ? allListsAsOne.value[role] : Object.values(allListsAsOne.value).flat()
      const character = pool.find(c => c.id === id || c.id === id.replaceAll('_', ''))
      if (!character) {
        addNewError(`Character with ID <strong>${id}</strong> was not found in your library or in the official library.`);
      }
      return character;
    };

    charsList.value = ROLES.reduce((acc, role) => {
      const direct = localList
          .filter(el => el.team === role)
          .map(el => findCharacterById(el.id, role))
          .filter(Boolean);

      const additional = localList
          .filter(el => !el.team)
          .map(el => {
            const id = typeof el === 'object' && el?.id ? el.id : el;
            const character = findCharacterById(id);
            return character && character.team === role ? { id } : null;
          })
          .filter(Boolean);

      acc[role] = [...direct, ...additional]
      return acc;
    }, {});
  }
}

function addNewError(message){
  if(errorList.value.findIndex(el => el === message) !== -1) return
  errorList.value.push(message)
}

watch(meta, (newVal) => {
  isCanSave.value = !isEqual(newVal, getEmptyValue())
}, { deep: true })

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>