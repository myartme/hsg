<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden">
    <div class="flex gap-6 flex-grow">
      <list class="w-[50%]"
          @on-create-script="onCreateScript"
          @on-import-script="onImportScript"
          @on-select-script="onSelectScript"
          @on-edit-tags="onEditTags" />
      <import-script label="Import Content" v-if="isImportScript" />
      <edit-tags label="Script tags" v-if="isEditScriptTags" />
    </div>
  </div>
</template>
<script setup>
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {DEFAULT_VERSION, SET_INDEX} from "@/constants/other";
import {onMounted} from "vue";
import List from "@/components/craft/scripts/List.vue";
import router from "@/router";
import ImportScript from "@/components/craft/scripts/ImportScript.vue";
import EditTags from "@/components/craft/scripts/EditTags.vue";

const craftStore = useCraftStore()
const { activeScriptIndex, activeVersion, isSavedScript, isEditScriptTags, isImportScript } = storeToRefs(craftStore)

function onCreateScript(){
  isSavedScript.value = false
  activeScriptIndex.value = SET_INDEX.DEFAULT
  activeVersion.value = DEFAULT_VERSION
  isImportScript.value = false
  isEditScriptTags.value = false
  router.push({ name: 'scriptEdit' })
}

function onImportScript(){
  isImportScript.value = !isImportScript.value
  isEditScriptTags.value = false
}

function onSelectScript(event){
  if(activeScriptIndex.value === event){
    activeScriptIndex.value = SET_INDEX.DEFAULT
  } else {
    activeScriptIndex.value = event
  }
}

function onEditTags(){
  isEditScriptTags.value = !isEditScriptTags.value
  isImportScript.value = false
}

onMounted(async () => {
  await craftStore.loadSets()
  await craftStore.loadScripts()
  await craftStore.loadTags()
  craftStore.resetMeta()
})
</script>