<template>
  <div v-if="isShowForm" class="border-3 rounded-2xl cursor-pointer transition-shadow items-center bg-[color:var(--color-bg)] border-[color:var(--color-active)] ">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
      <simple-input
          @input="checkName"
          v-model:value="character.name"
          :errored="isVisibleError"
          :label="$t('character.name')"
          :error-text="errorText"
          :maxlength="30">
      </simple-input>
      <simple-dropdown
          v-model:value="character.team"
          :label="$t('character.team')"
          :list="ROLES"
          :default-value="$t('character.selectRoleType')" />
      <simple-textarea
          v-model:value="character.ability"
          :label="$t('character.ability')"
          :maxlength="250" />
      <div class="flex flex-col h-full">
        <queue-positions
            v-model:value="character.scriptCharacterPriority"
            :action-text="$t('character.clickToSetScriptPriority')"
            :label="$t('character.scriptCharacterPriority')"
            class="mb-0"
            :tooltip="$t('info.scriptCharacterPriority')"
            :character="character"  />
        <p class="text-xs ml-1">{{ $t('library.roleNotCreatedYet') }}</p>
        <div class="flex justify-center mt-auto mb-1">
          <button
              @click="addNewRole"
              :disabled="!isFullData"
              :class="[
                  'px-4 py-2 rounded-md shadow whitespace-nowrap',
                  !isFullData ? 'bg-[color:var(--color-bg)]' : 'bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]'
              ]">{{ $t('library.addCharacterButton') }}</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="list.length > 0">
    <div class="text-lg font-bold uppercase tracking-wide mb-3 mt-3 text-theme bg-[color:var(--color-bg)]">
      {{ $t('library.newCharacters') }}
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
import {useI18n} from "vue-i18n";
import RoleLine from "@/components/library/Roles/RoleLine.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import { EMPTY_CHARACTER, ROLES } from "@/constants/roles";
import { storeToRefs } from "pinia";
import { useLibraryStore } from "@/store/library";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import QueuePositions from "@/components/library/RoleEditor/QueuePositions.vue";

const { t } = useI18n()
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
    errorText.value = t('library.characterExistsInLibrary')
    return
  }
  if (list.value.findIndex(el => el.name === str) !== -1) {
    isVisibleError.value = true
    errorText.value = t('library.characterExistsInNew')
    return
  }

  isVisibleError.value = false
}

function addNewRole(){
  list.value.push(character.value)
  characterInit()
}
</script>