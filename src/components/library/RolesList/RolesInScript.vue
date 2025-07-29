<template>
  <sector-container
      header-class="flex items-center gap-2 p-5 pb-0"
      :is-show-sticky="isCanSave"
      :name="instance?.type.name">
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
    <template #header v-if="meta.name && list">
      <h2 class="text-2xl font-semibold">{{ meta.name }} ({{ totalRolesCount }})</h2>
      <action-button v-if="meta.isOfficial === false"
                     icon="options"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     :is-pressed="isEditCharacterLibrarySet"
                     :is-circle-type="false"
                     tooltip="Script options"
                     @click="$emit('onEditSet')" />
      <action-button v-if="meta.isOfficial === false"
                     icon="add"
                     icon-size="w-10 h-10"
                     button-class="w-10 h-10"
                     :is-pressed="isCreateCharacterLibrary"
                     :is-circle-type="false"
                     tooltip="Add new character to this set"
                     @click="$emit('onCreateRole')" />
      <action-button v-if="meta.isOfficial === false"
                     icon="import"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     :is-pressed="isImportCharacterLibrary"
                     :is-circle-type="false"
                     tooltip="Import new character(s) to this set"
                     @click="$emit('onImportRole')" />
      <sort-buttons
          :list="list"
          :sort-options-enabled="[SORT.NAME, SORT.OTHER_NIGHT, SORT.FIRST_NIGHT, SORT.SCRIPT_QUEUE]"
          :is-reset-sort="isResetSort"
          @update-sort="isResetSort = $event"
          @update-list="list = $event" />
    </template>
    <template #content>
      <div v-show="!isCanSave" class="flex gap-3 h-13 p-5 mt-3 list-element">
        <input v-model="searchedQuery"
               class="h-10 ml-3 w-full focus:outline-none text-theme placeholder-[color:var(--color-placeholder-text)]"
               type="text"
               placeholder="Filter by multiple keywords (separate with spaces)"
        />
        <div class="flex pr-3 gap-3">
          <action-button
              icon="cross"
              icon-size="w-4 h-4"
              icon-color="fill-[color:var(--color-error)]"
              icon-hover-color="hover:fill-[color:var(--color-button-error)]"
              button-class="w-7 h-7"
              @click.stop="resetList(true)" />
        </div>
      </div>
      <spinner v-show="isLoading"
               item-class="flex justify-center items-center py-5"
               :size="12" />
      <div v-show="!isLoading" v-for="(group, groupIndex) in list" :key="groupIndex">
        <div v-if="group.length > 0" class="text-lg font-bold uppercase tracking-wide mb-3 mt-3 title-theme">
          {{ groupIndex }}{{ groupIndex !== 'townsfolk' ? 'S' : '' }} ({{ group.length }})
        </div>
          <draggable-component
              :list="group"
              item-key="id"
              class="space-y-1">
            <template #item="{ element, index }">
              <role-line
                  :role-data="{ index: index, role: element }"
                  :is-official="meta.isOfficial"
                  :is-selected="activeCharacter?.id === element?.id"
                  @click="handleClick(element)" />
            </template>
          </draggable-component>
      </div>
    </template>
  </sector-container>
</template>
<script setup>
import draggableComponent from "vuedraggable";
import {computed, getCurrentInstance, ref, watch} from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import SectorContainer from "@/components/SectorContainer.vue";
import { useLibraryStore } from "@/store/library";
import { storeToRefs } from "pinia";
import RoleLine from "@/components/library/RolesList/RoleLine.vue";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, SORT} from "@/constants/other";
import {cloneDeep, isEqual} from "lodash/lang";
import {useIndexStore} from "@/store";
import SortButtons from "@/components/library/RolesList/SortButtons.vue";
import {activeCharacter} from "@/store/library/state";
import {debounce} from "lodash/function";
import Spinner from "@/components/ui/Spinner.vue";

defineOptions({
  name: 'roles-in-script'
})

const instance = getCurrentInstance()
const indexStore = useIndexStore()
const libraryStore = useLibraryStore()
const {activeMeta, activeList, isEditCharacterLibrarySet, isCreateCharacterLibrary, isImportCharacterLibrary } = storeToRefs(libraryStore)

const meta = ref(cloneDeep(activeMeta.value))
const list = ref(cloneDeep(activeList.value))
const isCanSave = ref(false)
const isResetSort = ref(false)
const emits = defineEmits(['selectedRole', 'update:list', 'onEditSet', 'onCreateRole', 'onImportRole'])
const totalRolesCount = computed(() => {
  return Object.values(list.value).flat().length
})


function save(){
  try{
    libraryStore.saveActiveSetWithList(list.value)
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
    resetList(true)
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

function resetList(isClick){
  if(!isClick && list.value.length === activeList.value.length) return
  isLoading.value = true
  list.value = cloneDeep(activeList.value)
  searchedQuery.value = ''
  debounce(() => {
    isResetSort.value = true
    isLoading.value = false
  }, 600)()
}

const handleClick = (role) => {
  emits('selectedRole', role)
}

watch(list, () => {
  isCanSave.value = !isEqual(activeList.value, list.value) && !isFiltered.value
}, { deep: true })

watch(activeList, () => {
  resetList(true)
})

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})


const searchedQuery = ref("")
const lastSearchedQuery = ref("")
const isLoading = ref(false)
const isFiltered = ref(false)


const debouncedSearch = debounce(async (val) => {
  if (!val.includes(lastSearchedQuery.value)) {
    isLoading.value = true
    lastSearchedQuery.value = val
    debouncedSearch(val)
    return
  }
  lastSearchedQuery.value = val
  list.value = getFilteredQuery(val)
  isLoading.value = false
}, 500)

function getFilteredQuery(query){
  return Object.entries(activeList.value).reduce((acc, [team, characters]) => {
    const filteredCharacters = characters.filter(character => {
      return filterTextMethod(character, query)
    });

    if (filteredCharacters.length) {
      acc[team] = filteredCharacters;
    }

    return acc;
  }, {});
}

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

watch(searchedQuery, (newVal) => {
  isFiltered.value = newVal !== ''
  debouncedSearch(newVal)
})
watch(activeList, () => {
  list.value = {...activeList.value}
})
</script>