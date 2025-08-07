<template>
  <sector-container
      :is-background-enabled="false"
      :name="instance?.type.name"
      container-class="flex-1 pr-1 rounded-md overflow-auto relative w-40 min-w-[10rem] max-w-[10rem]"
      content-class="flex flex-col gap-4">
    <template #content>
      <set-icon v-for="(file, key) in infoSets"
                   :key="file.id"
                   :name="file.name"
                   :logo="file.logo"
                   :selected="key === activeSetIndex"
                   @click="selectScript(file, key)" />
      <set-icon
          name="Import Set"
          :half-size="true"
          :selected="activeSetIndex === SET_INDEX.IMPORT"
          @click="$emit('onCreateScript', SET_INDEX.IMPORT)" />
      <set-icon
          name="Create Set"
          :half-size="true"
          :selected="activeSetIndex === SET_INDEX.CREATE"
          @click="$emit('onCreateScript', SET_INDEX.CREATE)" />
    </template>
  </sector-container>
</template>
<script setup>
import {SET_INDEX} from "@/constants/other";
import SectorContainer from "@/components/SectorContainer.vue";
import SetIcon from "@/components/library/Sets/SetIcon.vue";
import {useLibraryStore} from "@/store/library";
import {storeToRefs} from "pinia";
import {getCurrentInstance} from "vue";

defineOptions({
  name: 'script-list'
})

const props = defineProps({
  infoSets: Object
})

const libraryStore = useLibraryStore()
const { activeSetIndex } = storeToRefs(libraryStore)

const instance = getCurrentInstance()
const emits = defineEmits(['onSelectScript', 'onCreateScript'])

const selectScript = (file, key) => {
  emits('onSelectScript', {
    file: file,
    key: key
  })
}
</script>