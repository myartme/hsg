<template>
  <action-button v-if="sortOptionsEnabled.length > 0"
                 icon="sort"
                 icon-size="w-10 h-10"
                 button-class="w-10 h-10"
                 :is-pressed="isShowSort"
                 :is-circle-type="false"
                 tooltip="Sort"
                 @click="isShowSort = !isShowSort" />
  <transition-group name="slide-fade" tag="div" class="flex gap-1">
    <template v-if="isShowSort">
      <action-button v-if="sortOptionsEnabled.find(el => el === SORT.NAME)"
                     :icon="getIcon(SORT.NAME)"
                     icon-size="w-6 h-6"
                     tooltip="By name"
                     :is-pressed="sortOptions.key === SORT.NAME"
                     button-class="w-9 h-9"
                     @click="sortListByName" />
      <action-button v-if="sortOptionsEnabled.find(el => el === SORT.SCRIPT_QUEUE)"
                     :icon="getIcon(SORT.SCRIPT_QUEUE)"
                     icon-size="w-7 h-7"
                     tooltip="By script queue"
                     :is-pressed="sortOptions.key === SORT.SCRIPT_QUEUE"
                     button-class="w-9 h-9"
                     @click="sortListByQueue" />
      <action-button v-if="sortOptionsEnabled.find(el => el === SORT.FIRST_NIGHT)"
                     :icon="getIcon(SORT.FIRST_NIGHT)"
                     icon-size="w-7 h-7"
                     tooltip="By first night order"
                     :is-pressed="sortOptions.key === SORT.FIRST_NIGHT"
                     button-class="w-9 h-9"
                     @click="sortListByFirstNight" />
      <action-button v-if="sortOptionsEnabled.find(el => el === SORT.OTHER_NIGHT)"
                     :icon="getIcon(SORT.OTHER_NIGHT)"
                     icon-size="w-7 h-7"
                     tooltip="By other night order"
                     :is-pressed="sortOptions.key === SORT.OTHER_NIGHT"
                     button-class="w-9 h-9"
                     @click="sortListByOtherNight" />
      <action-button v-if="sortOptionsEnabled.find(el => el === SORT.AUTHOR)"
                     :icon="getIcon(SORT.AUTHOR)"
                     icon-size="w-7 h-7"
                     tooltip="By author"
                     :is-pressed="sortOptions.key === SORT.AUTHOR"
                     button-class="w-9 h-9"
                     @click="sortListByAuthor" />
      <action-button v-if="sortOptionsEnabled.find(el => el === SORT.DATE)"
                     :icon="getIcon(SORT.DATE)"
                     icon-size="w-7 h-7"
                     tooltip="By date"
                     :is-pressed="sortOptions.key === SORT.DATE"
                     button-class="w-9 h-9"
                     @click="sortListByDate" />
    </template>
  </transition-group>
</template>
<script setup>
import {ref, watch} from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import {SORT} from "@/constants/other";
import {useLibraryStore} from "@/store/library";
import {storeToRefs} from "pinia";

const props = defineProps({
  list: [Object, Array],
  sortOptionsEnabled: {
    type: Array,
    default: []
  },
  isResetSort: Boolean
})

const libraryStore = useLibraryStore()
const { queuePositions } = storeToRefs(libraryStore)
const groupedList = ref(props.list)
const isShowSort = ref(false)
const emits = defineEmits(['updateList', 'updateSort'])
const sortOptions = ref(sortToDefault())

function sortList(key, asc) {
  sortOptions.value = {key: key, asc: asc}
  if (!key || key === SORT.DEFAULT) return

  let newGrouped = {}
  const list = groupedList.value
  if (Array.isArray(list)){
    newGrouped = [...list].sort((a, b) => sortFunction(a, b, key, asc))
  } else if (typeof list === 'object' && list !== null) {
    newGrouped = {}

    Object.entries(list).forEach(([index, value]) => {
      newGrouped[index] = [...value].sort((a, b) => sortFunction(a, b, key, asc))
    })
  }

  emits('updateList', newGrouped)
}

function sortFunction(a, b, key, asc) {
  let valA = ''
  let valB = ''
  let date = new Date()
  switch (key) {
    case SORT.NAME:
      valA = a.name || ''
      valB = b.name || ''
      break
    case SORT.SCRIPT_QUEUE:
      valA = getQueuePosition(a)
      valB = getQueuePosition(b)
      break
    case SORT.FIRST_NIGHT:
      valA = a.firstNight ?? 999
      valB = b.firstNight ?? 999
      break
    case SORT.OTHER_NIGHT:
      valA = a.otherNight ?? 999
      valB = b.otherNight ?? 999
      break
    case SORT.AUTHOR:
      valA = a.author || ''
      valB = b.author || ''
      break
    case SORT.DATE:
      valA = a.date || date.toISOString()
      valB = b.date || date.toISOString()
      break
  }
  if (typeof valA === 'string' && typeof valB === 'string') {
    return asc ? valA.localeCompare(valB,'en') : valB.localeCompare(valA, 'en')
  }

  const result = valA > valB ? 1 : valA < valB ? -1 : 0
  return asc ? result : -result
}

function getQueuePosition(character){
  const result = queuePositions.value[character.team]?.find(el => el.id === character.id)
  return result ? result.scriptCharacterPriority : 999
}

function sortToDefault(){
  emits('updateSort', false)
  return {
    key: SORT.DEFAULT,
    asc: true,
  }
}

function sortListByName(){
  const asc = sortOptions.value.key !== SORT.NAME ? true : !sortOptions.value.asc
  sortList(SORT.NAME, asc)
}

function sortListByQueue(){
  const asc = sortOptions.value.key !== SORT.SCRIPT_QUEUE ? true : !sortOptions.value.asc
  sortList(SORT.SCRIPT_QUEUE, asc)
}

function sortListByFirstNight(){
  const asc = sortOptions.value.key !== SORT.FIRST_NIGHT ? true : !sortOptions.value.asc
  sortList(SORT.FIRST_NIGHT, asc)
}

function sortListByOtherNight(){
  const asc = sortOptions.value.key !== SORT.OTHER_NIGHT ? true : !sortOptions.value.asc
  sortList(SORT.OTHER_NIGHT, asc)
}

function sortListByAuthor(){
  const asc = sortOptions.value.key !== SORT.AUTHOR ? true : !sortOptions.value.asc
  sortList(SORT.AUTHOR, asc)
}

function sortListByDate(){
  const asc = sortOptions.value.key !== SORT.DATE ? true : !sortOptions.value.asc
  sortList(SORT.DATE, asc)
}

function getIcon(keyIcon){
  const {key, asc} = sortOptions.value
  const direction = key === keyIcon && !asc ? "Up" : "Down"

  return `${keyIcon}${direction}`
}

watch(() => props.isResetSort, () => {
  if(props.isResetSort){
    sortOptions.value = sortToDefault()
  }
})

watch(() => props.list, (newList) => {
  groupedList.value = newList
}, { immediate: true })
</script>
<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>