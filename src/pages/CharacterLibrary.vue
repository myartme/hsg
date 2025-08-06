<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden">
    <set-list
        :info-sets="metaSets"
        @on-select-script="activeSetIndex = $event.key"
        @on-create-script="activeSetIndex = $event" />
    <div class="flex gap-6 flex-grow">
      <edit-set v-if="activeSetIndex === SET_INDEX.CREATE"
                label="Create Set" />
      <import-set v-if="activeSetIndex === SET_INDEX.IMPORT"
                  label="Import Set" />
      <template v-else>
        <roles-in-script v-if="activeSetIndex >= 0"
                         :key="activeMeta.id"
                         class="w-[50%]"
                         @on-edit-set="onCanEdit"
                         @on-create-role="onCanCreate"
                         @on-import-role="onCanImport"
                         @selected-role="handleRoleSelected" />
        <import-form v-if="isImportCharacterLibrary"
                   @create-role="resetRightPanels"
                   class="w-[50%]" />
        <edit-form v-if="activeCharacter && !isImportCharacterLibrary && !isEditCharacterLibrarySet"
                   :is-new="isCreateCharacterLibrary"
                   :key="activeCharacter.name || 'new'"
                   @create-role="resetRightPanels"
                   class="w-[50%]" />
        <edit-set v-if="isEditCharacterLibrarySet"
                    label="Edit Script Options" />
      </template>
    </div>
  </div>
</template>

<script setup>
import {onMounted, watch} from "vue";
import RolesInScript from "@/components/library/Roles/RolesInScript.vue";
import EditForm from "@/components/library/RoleEditor/EditForm.vue";
import EditSet from "@/components/library/Sets/EditSet.vue";
import SetList from "@/components/library/Sets/SetList.vue";
import { useLibraryStore } from "@/store/library";
import { storeToRefs } from "pinia";
import ImportSet from "@/components/library/Sets/ImportSet.vue";
import {SET_INDEX} from "@/constants/other";
import ImportForm from "@/components/library/RoleEditor/ImportForm.vue";
import {EMPTY_CHARACTER} from "@/constants/roles";
import {isEqual} from "lodash/lang";

const libraryStore = useLibraryStore()
const { metaSets, activeSetIndex, activeCharacter, activeMeta, isEditCharacterLibrarySet, isCreateCharacterLibrary, isImportCharacterLibrary } = storeToRefs(libraryStore)

const handleScriptOptionsShow = () => {
  isEditCharacterLibrarySet.value = !isEditCharacterLibrarySet.value
  activeCharacter.value = null
}

const handleRoleSelected = (role) => {
  if(isEqual(role, activeCharacter.value)){
    activeCharacter.value = null
  } else {
    activeCharacter.value = { ...role }
  }

  resetRightPanels()
}

function onCanEdit(){
  isEditCharacterLibrarySet.value = !isEditCharacterLibrarySet.value
  isCreateCharacterLibrary.value = false
  isImportCharacterLibrary.value = false
}

function onCanCreate(){
  isCreateCharacterLibrary.value = !isCreateCharacterLibrary.value;
  isImportCharacterLibrary.value = false
  isEditCharacterLibrarySet.value = false

  activeCharacter.value = isCreateCharacterLibrary.value ? { ...EMPTY_CHARACTER, edition: activeMeta.value.id } : null
}

function onCanImport(){
  isImportCharacterLibrary.value = !isImportCharacterLibrary.value;
  isCreateCharacterLibrary.value = false
  isEditCharacterLibrarySet.value = false
  activeCharacter.value = null
}

function resetRightPanels(){
  isEditCharacterLibrarySet.value = false
  isCreateCharacterLibrary.value = false
  isImportCharacterLibrary.value = false
}

onMounted(async () => {
  await libraryStore.loadSets()
});

watch(activeSetIndex, () => {
  resetRightPanels()
  activeCharacter.value = null
})
</script>