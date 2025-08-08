<template>
  <sector-container
      :name="instance?.type.name"
      container-class="flex-1 rounded-md overflow-auto relative"
      content-class="flex flex-col">
    <template #content>
      <div class="pt-3"></div>
      <div class="flex gap-3 h-13 p-5 ml-5 mr-5 list-element">
        <input v-model="searchedQuery"
               class="h-10 ml-3 w-full focus:outline-none text-theme placeholder-[color:var(--color-placeholder-text)]"
               type="text"
               placeholder="Filter by multiple keywords (separate with spaces)"
        />
        <div class="flex pr-3 gap-3">
          <div v-click-outside="() => isEditionFilterShow = false">
          <action-button
              icon="filter"
              icon-size="w-4 h-4"
              icon-color="fill-[color:var(--color-menu-active)]"
              icon-hover-color="group-hover:fill-[color:var(--color-active)]"
              button-class="w-7 h-7"
              @click.stop="isEditionFilterShow = !isEditionFilterShow" />
          <search-filter :items="selectedEditions"
                         :is-show="isEditionFilterShow"
                         :is-reset-filter="isResetFilter"
                         @on-update-items="onUpdateItems"
                         @on-update-max-filters="maxFilters = $event"
                         @on-update-is-reset-filter="isResetFilter = $event"
                         @on-update-is-show="isEditionFilterShow = $event" />
          </div>
          <action-button
              icon="cross"
              icon-size="w-4 h-4"
              icon-color="fill-[color:var(--color-error)]"
              icon-hover-color="group-hover:fill-[color:var(--color-button-error)]"
              button-class="w-7 h-7"
              @click.stop="resetAllFilters" />
        </div>
      </div>
      <div class="flex flex-wrap ml-5 mt-5 mr-5 gap-3">
        <template v-for="elem in ROLES">
          <div :class="[
              'cursor-pointer select-none rounded-lg border-3 border-[color:var(--color-border)]',
              { 'bg-[color:var(--color-active)]' : teamFilter === elem }
              ]"
               @click="changeRoleFilter(elem)">
            <p class="text-theme p-1 mr-3 ml-3">{{ elem }}</p>
          </div>
        </template>
      </div>
      <spinner v-if="isLoading"
          item-class="flex justify-center items-center py-5"
          size="w-18 h-18" />
      <template v-else>
        <div v-show="!isEmpty(listFiltered)"
             v-for="(group, team) in listFiltered"
             :key="team">
          <characters-team-list
              :team-name="team"
              :team-items="group" />
        </div>
        <p v-show="isEmpty(listFiltered)"
           class="text-theme flex justify-center items-center py-5 ml-5 mr-5">
          No matching characters. Please adjust the filter parameters to update the results.
        </p>
      </template>
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
import {ROLES} from "@/constants/roles";

defineOptions({
  name: 'full-character-list-craft'
})

const craftStore = useCraftStore()
const { characterListWithParams, isDeletingFromPdfCharacterList } = storeToRefs(craftStore)
const instance = getCurrentInstance()
const searchedQuery = ref("")
const lastSearchedQuery = ref("")
const list = ref({})
const listFiltered = ref({})
const teamFilter = ref("")
const selectedEditions = ref([])
const isLoading = ref(false)
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
  listFiltered.value = getFilteredQuery(val, getFiltered(list.value))
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
  teamFilter.value = ''
  isResetFilter.value = true
}

function changeRoleFilter(role){
  if(teamFilter.value === role){
    teamFilter.value = ''
  } else {
    teamFilter.value = role
  }

  listFiltered.value = getFiltered(list.value)
}

function onUpdateItems(filteredItems){
  selectedEditions.value = filteredItems
  isLoading.value = true
  if(filteredItems.length === 0){
    listFiltered.value = []
  } else if(filteredItems.length < maxFilters.value){
    listFiltered.value = getFilteredQuery(searchedQuery.value, getFiltered(list.value))
  } else {
    listFiltered.value = getFilteredQuery(searchedQuery.value, {...list.value})
  }

  debounce(() => {
    isLoading.value = false
  }, 500)()
}

function getFilteredQuery(query, characterList = {}){
  if(isEmpty(characterList)) return {}

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

function getFiltered(characterList = {}){
  return getFilteredEdition(getFilteredTeam(characterList))
}

function getFilteredEdition(characterList = {}){
  if(isEmpty(characterList)) return {}

  return Object.entries(characterList).reduce((acc, [team, characters]) => {
    const filteredCharacters = characters
        .filter(character => !(selectedEditions.value.length > 0 && !selectedEditions.value.includes(character.edition)))

    if (filteredCharacters.length) {
      acc[team] = filteredCharacters
    }

    return acc
  }, {});
}

function getFilteredTeam(characterList = {}){
  if(teamFilter.value){
    return { [teamFilter.value]: characterList[teamFilter.value] ?? [] }
  }

  return characterList
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

  if(isDeletingFromPdfCharacterList.value){
    listFiltered.value = getFilteredQuery(searchedQuery.value, getFiltered(list.value))
    isDeletingFromPdfCharacterList.value = false
  }
}, {immediate:true})
</script>