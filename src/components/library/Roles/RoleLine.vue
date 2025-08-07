<template>
  <div :class="[
      'grid list-element grid-cols-[3rem_3rem_minmax(150px,1fr)_minmax(auto,85%)]',
      isSelected
        ? 'bg-[color:var(--color-list-element)] hover:bg-[color:var(--color-hover-active)]'
        : 'bg-[color:var(--color-bg)] hover:bg-[color:var(--color-hover-bg)]'
  ]">
    <div class="flex justify-center font-bold text-center">
      <info-tooltip v-if="requiredText" :text="requiredText" icon="alert" icon-size="w-4 h-4" icon-color="fill-[color:var(--color-error)]" />
      <p v-else class="text-theme">{{ index + 1 }}</p>
    </div>
    <div class="w-10 h-10 relative">
      <img :src="getImageFirstUrl(role, isOfficial)"
           class="absolute inset-0 w-full h-full object-cover rounded scale-150"
           :alt="role.name" />
    </div>
    <span class="block break-words whitespace-normal font-bold title-theme">{{ role.name }}</span>
    <span class="text-xs text-theme">{{ role.ability }}</span>
  </div>
</template>
<script setup>
import { computed } from "vue";
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
import {getImageFirstUrl} from "@/constants/other";
import {MAIN_ROLES} from "@/constants/roles";
import {useLibraryStore} from "@/store/library";
import {storeToRefs} from "pinia";

const props = defineProps({
  roleData: Object,
  isSelected: {
    type: Boolean,
    default: false
  },
  isOfficial: Boolean
})

const {queuePositions} = storeToRefs(useLibraryStore())

const index = computed(() => props.roleData.index)
const role = computed(() => props.roleData.role)
const requiredText = computed(() => {
  let text = ""
  if(role.value.name === ""){
    text += "Name is required but empty<br>"
  }
  if(role.value.ability === ""){
    text += "Ability is required but empty<br>"
  }
  if(role.value.team === ""){
    text += "Team is required but empty<br>"
  }
  if(MAIN_ROLES.includes(role.value.team)) {
    const elem = queuePositions.value[role.value.team]?.find(el => el.id === role.value.id)
    if(!elem){
      text += "Script character priority is required but empty<br>"
    }
  }
  return text
})
</script>