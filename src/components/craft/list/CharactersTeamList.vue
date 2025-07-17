<template>
  <div>
    <h3 class="text-sm ml-5 font-bold uppercase mb-3 pt-3 title-theme"
        @click="isOpen = !isOpen">
      {{ teamName }} {{ teamName !== 'townsfolk' ? 's' : '' }}
      <span class="text-sm ml-2">{{ isOpen ? '▲' : '▼' }}</span>
    </h3>
    <template v-if="isOpen">
      <div v-for="character in teamItems"
          class="flex gap-3 ml-5 mr-5 mb-1 list-element hover:bg-[color:var(--color-hover-bg)]"
           :key="character.edition+'-'+character.id"
           @click="selectRole(character)"
      >
        <div class="w-10 h-10 flex-shrink-0 relative ml-2">
          <img class="absolute inset-0 w-full h-full object-cover scale-150"
              :src="getImageFirstUrl(character, character.isOfficial)"
              :alt="character.name" />
        </div>
        <span class="w-1/4 font-bold title-theme">{{ character.name }}</span>
        <span class="w-3/4 text-xs mr-2 text-[color:var(--color-text)]">{{ character.ability }}</span>
      </div>
    </template>
  </div>
</template>
<script setup>
import {ref} from "vue";
import {getImageFirstUrl} from "@/constants/other";
import {useCraftStore} from "@/store/craft";

const props = defineProps({
  teamName: String,
  teamItems: Object,
  isFiltered: {
    type: Boolean,
    default: false
  },
  isOpened: {
    type: Boolean,
    default: true
  }
});

const craftStore = useCraftStore()
const isOpen = ref(props.isOpened)
const emits = defineEmits(['deleteItem'])

function selectRole(character) {
  craftStore.addElementToSecondList(character, props.teamName)
  emits('deleteItem')
}
</script>