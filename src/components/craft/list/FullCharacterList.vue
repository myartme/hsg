<template>
  <sector-container
      :name="instance?.type.name"
      container-class="flex-1 rounded-md overflow-auto relative"
      content-class="flex flex-col">
    <template #content>
      <div class="pt-3"></div>
      <div class="flex gap-3 h-13 p-5 ml-5 mr-5 list-element">
        <input v-model="searchedQuery"
               class="h-10 ml-3 w-full focus:outline-none text-[color:var(--color-text)] placeholder-[color:var(--color-placeholder-text)]"
               type="text"
               placeholder="Filter by multiple keywords (separate with spaces)"
        />
        <div class="flex pr-3 gap-3">
          <action-button
              icon="filter"
              icon-size="w-4 h-4"
              icon-color="fill-[color:var(--color-menu-active)]"
              icon-hover-color="hover:fill-[color:var(--color-active)]"
              button-class="w-7 h-7"
              @click.stop="isEditionFilterShow = !isEditionFilterShow" />
          <action-button
              icon="cross"
              icon-size="w-4 h-4"
              icon-color="fill-[color:var(--color-error)]"
              icon-hover-color="hover:fill-[color:var(--color-button-error)]"
              button-class="w-7 h-7"
              @click.stop="resetAllFilters" />
        </div>
        <search-filter :items="selectedEditions"
                       :is-show="isEditionFilterShow"
                       :is-reset-filter="isResetFilter"
                       @on-update-items="onUpdateItems"
                       @on-update-max-filters="maxFilters = $event"
                       @on-update-is-reset-filter="isResetFilter = $event"
                       @on-update-is-show="isEditionFilterShow = $event" />
      </div>
      <spinner v-show="isLoading"
          item-class="flex justify-center items-center py-5"
          :size="12" />
      <div v-show="!isLoading"
           v-for="(group, team) in listFiltered"
           :key="team">
        <characters-team-list
            @delete-item="onDeleteItem"
            :team-name="team"
            :team-items="group"
            :is-opened="team !== 'traveller' && team !== 'fabled'" />
      </div>
    </template>
  </sector-container>
</template>
<script setup>
import {getCurrentInstance, ref, watch} from 'vue'
import SectorContainer from "@/components/SectorContainer.vue";
import CharactersTeamList from "@/components/craft/list/CharactersTeamList.vue";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import ActionButton from "@/components/ui/ActionButton.vue";
import SearchFilter from "@/components/craft/list/SearchFilter.vue";
import {debounce} from "lodash/function";
import {isEmpty} from "lodash/lang";
import Spinner from "@/components/ui/Spinner.vue";

defineOptions({
  name: 'full-character-list-craft'
})

const craftStore = useCraftStore()
const { characterListWithParams } = storeToRefs(craftStore)
const instance = getCurrentInstance()
const searchedQuery = ref("")
const lastSearchedQuery = ref("")
const list = ref({})
const listFiltered = ref({})
const selectedEditions = ref([])
const isLoading = ref(false)
const isDeleting = ref(false)
const isEditionFilterShow = ref(false)
const maxFilters = ref(0)
const isResetFilter = ref(false)

const debouncedSearch = debounce(async (val) => {
  if (!val.includes(lastSearchedQuery.value)) {
    isLoading.value = true
    lastSearchedQuery.value = val
    debouncedSearch(val)
    return
  }
  lastSearchedQuery.value = val
  listFiltered.value = getFilteredQuery(val, getFilteredEdition())
  isLoading.value = false
}, 500)

function filterTextMethod(character, query){
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

  if (searchTerms.length === 0)
    return true

  const name = character.name.toLowerCase();
  const ability = character.ability.toLowerCase();

  return searchTerms.every(term =>
      name.includes(term) ||
      ability.includes(term)
  );
}

async function resetAllFilters(){
  searchedQuery.value = ''
  isResetFilter.value = true
}

function onUpdateItems(filteredItems){
  selectedEditions.value = filteredItems
  isLoading.value = true
  if(filteredItems.length === 0){
    listFiltered.value = []
  } else if(filteredItems.length < maxFilters.value){
    listFiltered.value = getFilteredQuery(searchedQuery.value, getFilteredEdition())
  } else {
    listFiltered.value = getFilteredQuery(searchedQuery.value, {...list.value})
  }

  debounce(() => {
    isLoading.value = false
  }, 500)()
}

function getFilteredQuery(query, characterList = {}){
  if(isEmpty(characterList)){
    characterList = list.value
  }
  return Object.entries(characterList).reduce((acc, [team, characters]) => {
    const filteredCharacters = characters.filter(character => {
      return filterTextMethod(character, query)
    });

    if (filteredCharacters.length) {
      acc[team] = filteredCharacters;
    }

    return acc;
  }, {});
}

function getFilteredEdition(characterList = {}){
  if(isEmpty(characterList)){
    characterList = list.value
  }
  return Object.entries(characterList).reduce((acc, [team, characters]) => {
    const filteredCharacters = characters
        .filter(character => !(selectedEditions.value.length > 0 && !selectedEditions.value.includes(character.edition)))

    if (filteredCharacters.length) {
      acc[team] = filteredCharacters
    }

    return acc
  }, {});
}

function onDeleteItem(){
  isDeleting.value = true
}

watch(searchedQuery, (newVal) => {
  if(isEditionFilterShow.value){
    isEditionFilterShow.value = !isEditionFilterShow.value
  }
  debouncedSearch(newVal)
})


watch(characterListWithParams, () => {
  list.value = {...characterListWithParams.value}
  listFiltered.value = {...characterListWithParams.value}

  if(isDeleting.value){
    listFiltered.value = getFilteredQuery(searchedQuery.value, getFilteredEdition())
    isDeleting.value = false
  }
}, {immediate:true})
</script>