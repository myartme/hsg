<template>
  <div class="grid grid-cols-[70%_30%] gap-4 items-start mb-3">
    <div>
      <simple-dropdown
          label="Tags list"
          v-model:value="selectedTag"
          :list="selectorList"
          default-value="Select tag to filter..." />
      <input-title-block label="Filter by character" class="mt-2" />
      <div class="w-full grid grid-cols-[1fr_auto] items-center gap-1">
        <input
            v-model="searchedQuery"
            class="px-3 pr-10 py-2 h-10 text-sm border-2 rounded-md focus:outline-none text-theme placeholder-[color:var(--color-placeholder-text)] border-[color:var(--color-border)]"
            type="text"
            placeholder="Start typing character name..."
        />
        <button
            @click="isEmptyFilter = true"
            :class="[
                    'ml-4 px-4 py-2 rounded-xl min-w-18 max-w-18 whitespace-nowrap text-theme border-[color:var(--color-border)]',
                    isEmptyFilter
                    ? 'cursor-not-allowed bg-[color:var(--color-disable-bg)]'
                    : 'cursor-pointer text-theme bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]'
                ]"
            :disabled="isEmptyFilter"
        >
          Reset
        </button>
      </div>
      <div class="flex flex-wrap gap-2 mt-3">
        <img
            v-for="char in listFiltered"
            :key="char.id"
            class="h-10 w-10 border rounded-md cursor-pointer hover:bg-[color:var(--color-hover-bg)] border-[color:var(--color-border)]"
            :src="getImageFirstUrl(char)"
            @click="addToCharacters(char)"
            :alt="char.id"
        />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex border-3 border-[color:var(--color-border)] rounded-2xl" v-if="filteredScriptListTags.length > 0">
        <input-color-tag
            div-class="ml-2 mr-2"
            label="Tags"
            v-model:value="filteredScriptListTags" />
      </div>
      <div class="flex border-3 border-[color:var(--color-border)] rounded-2xl" v-if="filteredScriptListCharacters.length > 0">
        <input-image-tag
            div-class="ml-2 mr-2"
            label="Characters"
            v-model:value="filteredScriptListCharacters" />
      </div>
    </div>
  </div>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import InputColorTag from "@/components/craft/scripts/InputColorTag.vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";
import {debounce} from "lodash/function";
import {getImageFirstUrl} from "@/constants/other";
import InputImageTag from "@/components/craft/scripts/InputImageTag.vue";

defineOptions({
  name: 'filter-tags'
})

const props = defineProps({
  label: String,
  selectedTags: Array
})
const craftStore = useCraftStore()
const { characterListWithParams, tags, filteredScriptListTags, filteredScriptListCharacters } = storeToRefs(craftStore)
const searchedQuery = ref("")
const lastSearchedQuery = ref("")
const listFiltered = ref([])
const selectedTag = ref('')
const isEmptyFilter = ref(true)
const emits = defineEmits(['onSelectedTags', 'onSelectedCharacters'])
const selectorList = computed(() => Object.values(tags.value)?.map(({ title }) => title))

const debouncedSearch = debounce(async (val) => {
  if (!val.includes(lastSearchedQuery.value)) {
    lastSearchedQuery.value = val
    debouncedSearch(val)
    return
  }
  lastSearchedQuery.value = val
  listFiltered.value = getCharacterList(val)
}, 500)

function getCharacterList(query){
  return Object.values(characterListWithParams.value)
      .map(characters => characters.filter(character => filterTextMethod(character, query)))
      .flat()
}

function filterTextMethod(character, query){
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

  if (searchTerms.length === 0)
    return true

  return searchTerms.every(term => character.name.toLowerCase().includes(term))
}

function addToCharacters(char){
  if(filteredScriptListCharacters.value.some(({id}) => id === char.id)) return
    filteredScriptListCharacters.value = [...filteredScriptListCharacters.value, {id: char.id, image: getImageFirstUrl(char)}]
}

function addNewTag(tag){
  if(tag !== '' && !filteredScriptListTags.value.some(({title}) => title === tag)){
    const idx = tags.value.findIndex(({title}) => title === tag)
    if(idx !== -1){
      filteredScriptListTags.value = [...filteredScriptListTags.value, tags.value[idx]]
    }
  }
  selectedTag.value = ''
}

watch(searchedQuery, (newVal) => {
  if(newVal === ''){
    listFiltered.value = []
  } else {
    debouncedSearch(newVal)
  }
})

watch(selectedTag, (val) => {
  addNewTag(val)
})

watch(filteredScriptListTags, (val) => {
  emits('onSelectedTags', val.map(tag => tag.title))
  isEmptyFilter.value = val.length === 0 && filteredScriptListCharacters.value.length === 0
}, {immediate: true})

watch(filteredScriptListCharacters, (val) => {
  emits('onSelectedCharacters', val.map(char => char.id))
  isEmptyFilter.value = val.length === 0 && filteredScriptListTags.value.length === 0
}, {immediate: true})

watch(isEmptyFilter, (val) => {
  if(val){
    filteredScriptListTags.value = []
    filteredScriptListCharacters.value = []
    searchedQuery.value = ''
  }
})
</script>