<template>
  <div v-if="isShowForm" class="border-3 rounded-2xl cursor-pointer transition-shadow items-center bg-[color:var(--color-bg)] border-[color:var(--color-active)] ">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
      <simple-input
          @input="checkName"
          v-model:value="character.name"
          :errored="isVisibleError"
          label="Name"
          :error-text="errorText"
          :maxlength="30">
      </simple-input>
      <simple-dropdown
          v-model:value="character.team"
          label="Team"
          :list="ROLES"
          default-value="Select Role Type..." />
      <simple-textarea
          v-model:value="character.ability"
          label="Ability"
          :maxlength="250" />
      <div class="flex flex-col h-full">
        <queue-positions
            v-model:value="character.scriptCharacterPriority"
            action-text="Click to set script queue position"
            label="Script Character Priority"
            class="mb-0"
            tooltip="The priority of this character on the script sheet."
            :character="character"  />
        <p class="text-xs ml-1">The role has not been created yet, so only manual input is available</p>
        <div class="flex justify-center mt-auto mb-1">
          <button
              @click="addNewRole"
              :disabled="!isFullData"
              :class="[
                  'px-4 py-2 rounded-md shadow whitespace-nowrap',
                  !isFullData ? 'bg-[color:var(--color-bg)]' : 'bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]'
              ]">Add character</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="list.length > 0">
    <div class="text-lg font-bold uppercase tracking-wide mb-3 mt-3 text-theme bg-[color:var(--color-bg)]">
      New characters
    </div>
    <div v-for="(element, index) in list" class="mb-1" :key="index">
      <role-line
          :role-data="{ index: index, role: element }"
          @click="handleClick(element)" />
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import RoleLine from "@/components/library/RolesList/RoleLine.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import { EMPTY_CHARACTER, ROLES } from "@/constants/roles";
import { storeToRefs } from "pinia";
import { useLibraryStore } from "@/store/library";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import QueuePositions from "@/components/library/RoleEditor/QueuePositions.vue";
const props = defineProps({
  isShowForm: Boolean
})

const { listSets } = storeToRefs(useLibraryStore())
const list = ref([])
const character = ref({ ...EMPTY_CHARACTER })
const errorText = ref(null)
const isVisibleError = ref(false)

const emits = defineEmits(['selectedRole'])

const isFullData = computed(() => {
  return !isVisibleError.value &&
      character.value.name !== '' &&
      character.value.team !== '' &&
      character.value.ability !== '' &&
      character.value.scriptCharacterPriority > 0
})

const characterInit = () => {
  character.value = { ...EMPTY_CHARACTER }
}

const handleClick = (role) => {
  emits('selectedRole', role)
}

function checkName(event) {
  const str = event.target.value

  if (listSets.value.findIndex(el => el.name === str) !== -1) {
    isVisibleError.value = true
    errorText.value = "There is already a character with this name in your library"
    return
  }
  if (list.value.findIndex(el => el.name === str) !== -1) {
    isVisibleError.value = true
    errorText.value = "There is already a character with this name in your new characters"
    return
  }

  isVisibleError.value = false
}

function addNewRole(){
  list.value.push(character.value)
  characterInit()
}
</script>