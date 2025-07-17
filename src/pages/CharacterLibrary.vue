<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden">
    <script-list
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
                         @update:is-option-show="handleScriptOptionsShow"
                         @create-role="onCanCreate"
                         @import-role="onCanImport"
                         @selected-role="handleRoleSelected" />
        <import-form v-if="isImport"
                   @create-role="resetRightPanels"
                   class="w-[50%]" />
        <edit-form v-if="activeCharacter && !isImport"
                   :is-new="isCreate"
                   :key="activeCharacter.name || 'new'"
                   @create-role="resetRightPanels"
                   class="w-[50%]" />
        <edit-set v-if="isEditSet"
                    label="Edit Script Options" />
      </template>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import RolesInScript from "@/components/library/RolesList/RolesInScript.vue";
import EditForm from "@/components/library/RoleEditor/EditForm.vue";
import EditSet from "@/components/library/ScriptList/EditSet.vue";
import ScriptList from "@/components/library/ScriptList/ScritpList.vue";
import { useLibraryStore } from "@/store/library";
import { storeToRefs } from "pinia";
import ImportSet from "@/components/library/ScriptList/ImportSet.vue";
import {SET_INDEX} from "@/constants/other";
import ImportForm from "@/components/library/RoleEditor/ImportForm.vue";
import {EMPTY_CHARACTER} from "@/constants/roles";
import {isEqual} from "lodash/lang";

const libraryStore = useLibraryStore()
const { metaSets, activeSetIndex, activeCharacter, activeMeta } = storeToRefs(libraryStore)

const isEditSet = ref(false)
const isCreate = ref(false)
const isImport = ref(false)

const handleScriptOptionsShow = () => {
  isEditSet.value = !isEditSet.value
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

function onCanCreate(){
  isCreate.value = !isCreate.value;
  isImport.value = false

  activeCharacter.value = isCreate.value ? { ...EMPTY_CHARACTER, edition: activeMeta.value.id } : null
}

function onCanImport(){
  isImport.value = !isImport.value;
  isCreate.value = false
  activeCharacter.value = null
}

function resetRightPanels(){
  isImport.value = false
  isCreate.value = false
}

onMounted(async () => {
  await libraryStore.loadSets()
});

watch(activeCharacter, (newVal) => {
  if(newVal !== null){
    isEditSet.value = false
  }
})
watch(activeSetIndex, () => {
  isEditSet.value = false
  activeCharacter.value = null
})
</script>