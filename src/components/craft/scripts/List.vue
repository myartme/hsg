<template>
  <sector-container :is-show-sticky="isCanSave" :name="instance?.type.name" header-class="flex items-center gap-2 p-5">
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
      <h2 class="text-2xl font-semibold">Scripts ({{localScriptList.length}})</h2>
      <action-button
          icon="add"
          icon-size="w-10 h-10"
          button-class="w-10 h-10"
          tooltip="Create script"
          :is-circle-type="false"
          @click="$emit('onCreateScript', SET_INDEX.CREATE)" />
      <action-button
          icon="import"
          icon-size="w-7 h-7"
          button-class="w-10 h-10"
          tooltip="Import script"
          :is-circle-type="false"
          @click="$emit('onImportScript', SET_INDEX.CREATE)" />
      <sort-buttons
          :list="localScriptList"
          :is-reset-sort="isResetSort"
          :sort-options-enabled="[SORT.NAME, SORT.AUTHOR, SORT.DATE]"
          @update-sort="isResetSort = $event"
          @update-list="localScriptList = $event" />
    </template>
    <template #content>
      <draggable-component
          :list="localScriptList"
          item-key="name"
          class="space-y-1"
          :move="onMove">
        <template #item="{ element, index }">
          <script-element-version-list
              :script-data="{ index: index, script: element }"
              :is-selected="index === activeScriptIndex"
              @is-open-options="isOpenOptions = !isOpenOptions"
              @click="$emit('onSelectScript', index); activeVersion = ZERO_VERSION" />
        </template>
      </draggable-component>
      <script-options-popup
          :is-open="isOpenOptions"
          @is-open-options="isOpenOptions = !isOpenOptions; resetMeta()" />
    </template>
  </sector-container>
</template>
<script setup>
import SortButtons from "@/components/library/RolesList/SortButtons.vue";
import SectorContainer from "@/components/SectorContainer.vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import {useCraftStore} from "@/store/craft";
import {getCurrentInstance, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import draggableComponent from "vuedraggable";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, SET_INDEX, SORT, ZERO_VERSION} from "@/constants/other";
import {useIndexStore} from "@/store";
import {isEqual} from "lodash/lang";
import ScriptElementVersionList from "@/components/craft/scripts/Line.vue";
import {activeVersion} from "@/store/craft/state";
import ScriptOptionsPopup from "@/components/craft/scripts/ScriptOptionsPopup.vue";
import {resetMeta} from "@/store/craft/set";

defineOptions({
  name: 'script-element-list'
})

const craftStore = useCraftStore()
const indexStore = useIndexStore()
const instance = getCurrentInstance()
const { activeScriptIndex, scriptList } = storeToRefs(craftStore)
const localScriptList = ref([])
const isCanSave = ref(false)
const isResetSort = ref(true)
const isOpenOptions = ref(false)
const emits = defineEmits(['onCreateScript', 'onImportScript', 'onSelectScript'])

function resetList(){
  localScriptList.value = [ ...scriptList.value]
  isResetSort.value = true
}

function save(){
  try{
    craftStore.saveScriptsList(localScriptList.value)
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

function undo(){
  try{
    resetList()
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

function onMove() {
  return activeScriptIndex.value < 0
}

watch(scriptList, () => {
  localScriptList.value = [ ...scriptList.value]
}, {immediate: true, deep: true})

watch(localScriptList, () => {
  isCanSave.value = !isEqual(localScriptList.value, scriptList.value)
}, { deep: true })

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>