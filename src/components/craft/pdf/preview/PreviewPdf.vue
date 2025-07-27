<template>
  <div class="w-[700px] pr-4 pl-4 pt-1 rounded-md overflow-auto relative bg-[color:var(--color-bg)] border-[color:var(--color-border)]">
    <div class="flex items-center gap-4 ml-8">
      <div class="w-[350px] overflow-hidden">
        <span class="text-xl font-semibold font-serif w-full truncate bg-transparent border border-transparent rounded outline-none uppercase title-theme">
          {{ trimmedName(pdfMeta.name, 25) }}
        </span>
      </div>
      <span class="ml-1 text-theme">by</span>
      <div class="w-[200px] overflow-hidden">
        <span class="text-lg font-serif w-full truncate bg-transparent border border-transparent rounded outline-none title-theme">
          {{ trimmedName(pdfMeta.author, 18) }}
        </span>
      </div>
    </div>
    <div v-for="(group, team) in pdfListWithParams" :key="team">
      <team-list :team-name="team" :team-items="group" />
    </div>
  </div>
</template>
<script setup>
import TeamList from "@/components/craft/pdf/preview/TeamList.vue";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {computed, onMounted, ref, watch} from "vue";
import {listWithParams, scriptList} from "@/store/craft/state";
import {isEmpty, isEqual} from "lodash/lang";
import {DEFAULT_SCRIPT_AUTHOR, DEFAULT_SCRIPT_NAME} from "@/constants/roles";
import IconElement from "@/components/ui/IconElement.vue";

const craftStore = useCraftStore()
const { pdfMeta, pdfListWithParams } = storeToRefs(craftStore)

const trimmedName = (text, maxLength) => {
  return text.length > maxLength
      ? text.slice(0, maxLength - 1) + '…'
      : text
}

onMounted(async () => {
  if(isEmpty(listWithParams.value)){
    await craftStore.loadSets()
  }
  if(isEmpty(scriptList.value)){
    await craftStore.loadScripts()
  }
  if(!pdfMeta.value.name){
    pdfMeta.value.name = DEFAULT_SCRIPT_NAME
  }
  if(!pdfMeta.value.author){
    pdfMeta.value.author = DEFAULT_SCRIPT_AUTHOR
  }
})
</script>