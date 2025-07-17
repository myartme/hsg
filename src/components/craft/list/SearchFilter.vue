<template>
  <div v-if="isShow"
       class="absolute right-5 top-[60px] z-50 border-2 rounded-md p-4 inline-block bg-[color:var(--color-bg)] border-[color:var(--color-border)] text-[color:var(--color-title-text)]">
    <label :class="labelClass">
      <input type="checkbox" value="official_trouble_brewing" class="cursor-pointer" v-model="localItems">
      <span>Trouble Brewing</span>
    </label>
    <label :class="labelClass">
      <input type="checkbox" value="official_sects_and_violets" class="cursor-pointer" v-model="localItems">
      <span>Sects & Violets</span>
    </label>
    <label :class="labelClass">
      <input type="checkbox" value="official_bad_moon_rising" class="cursor-pointer" v-model="localItems">
      <span>Bad Moon Rising</span>
    </label>
    <label :class="labelClass">
      <input type="checkbox" value="official_experimental" class="cursor-pointer" v-model="localItems">
      <span>Official Experimental</span>
    </label>
    <template v-for="meta in metaSets">
      <label v-if="meta.name !=='BotC official roles'" :class="labelClass">
        <input type="checkbox" class="cursor-pointer" :value="meta.id" v-model="localItems">
        <span>{{meta.name}}</span>
      </label>
    </template>
    <div class="flex items-center gap-4 pt-2">
      <button @click="applyEditionFilters" :class="[
          buttonClass,
          'bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]'
      ]">Apply</button>
      <button @click="resetFilterButton" :class="[
          buttonClass,
          'ml-auto w-30 bg-[color:var(--color-border)] hover:bg-[color:var(--color-hover-bg)]'
      ]">{{ resetFilterTitle }}</button>
    </div>
  </div>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import {useLibraryStore} from "@/store/library";
import {storeToRefs} from "pinia";

const props = defineProps({
  items: Array,
  isShow: {
    type: Boolean,
    default: false
  },
  isResetFilter: {
    type: Boolean,
    default: false
  }
})
const libraryStore = useLibraryStore()
const { metaSets } = storeToRefs(libraryStore)
const defaultFilterItems = computed(() => {
  const result = [
    'official_trouble_brewing',
    'official_sects_and_violets',
    'official_bad_moon_rising',
    'official_experimental'
  ]
  for(const meta of metaSets.value){
    result.push(meta.id)
  }

  return result
})
const resetFilterTitle = computed(() => {
      return defaultFilterItems.value.length === localItems.value.length
          ? 'Uncheck all'
          : 'Check all'
    }
)
const localItems = ref([])
const localItemsBackup = ref([])
const emits = defineEmits(['onUpdateItems', 'onUpdateIsShow', 'onUpdateIsResetFilter', 'onUpdateMaxFilters'])
const labelClass = "flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]";
const buttonClass = "px-4 py-1 rounded-md cursor-pointer";

function applyEditionFilters(){
  localItemsBackup.value = [...localItems.value]
  emits('onUpdateIsShow', false)
  emits('onUpdateItems', localItems.value)
}

function resetFilterButton(){
  if(defaultFilterItems.value.length === localItems.value.length){
    localItems.value = []
  } else {
    localItems.value = defaultFilterItems.value
  }
}

watch(() => props.isShow, (val) => {
  if(val){
    localItems.value = [...localItemsBackup.value]
  }
})

watch(() => props.isResetFilter, (val) => {
  if(val){
    localItems.value = defaultFilterItems.value
    localItemsBackup.value = defaultFilterItems.value
    emits('onUpdateIsResetFilter', false)
    emits('onUpdateItems', localItems.value)
  }
})

watch(() => props.items, (val) => {
  localItems.value = val
}, {immediate: true})

watch(defaultFilterItems, (val) => {
  localItems.value = val
  localItemsBackup.value = val
  emits('onUpdateMaxFilters', val.length)
}, { immediate: true })
</script>
