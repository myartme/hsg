<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden">
    <div class="flex gap-6 flex-grow">
      <list class="w-[50%]"
          @on-create-script="onCreateScript"
          @on-import-script="onImportScript"
          @on-select-script="onSelectScript" />
      <import-script v-if="activeScriptIndex === SET_INDEX.IMPORT" />
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
import ImportScript from "@/components/craft/list/ImportScript.vue";

const craftStore = useCraftStore()
const { activeScriptIndex, activeVersion, isSavedScript } = storeToRefs(craftStore)

function onCreateScript(event){
  activeScriptIndex.value = event
  isSavedScript.value = false
  activeVersion.value = DEFAULT_VERSION
  router.push({ name: 'scriptEdit' })
}

function onImportScript(event){
  activeScriptIndex.value = event
}

function onSelectScript(event){
  if(activeScriptIndex.value === event){
    activeScriptIndex.value = SET_INDEX.DEFAULT
  } else {
    activeScriptIndex.value = event
  }
}

onMounted(async () => {
  await craftStore.loadSets()
  await craftStore.loadScripts()
  craftStore.resetMeta()
})
</script>