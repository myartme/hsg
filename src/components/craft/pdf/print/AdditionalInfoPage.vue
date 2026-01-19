<template>
  <div>
    <!-- Content -->
    <!-- Travellers -->
      <div v-if="travellers.length > 0" class="mb-4">
        <team-header team="traveller" />
        <div v-for="character in travellers" :key="character.id" class="flex items-center space-x-4 -m-1.5 ml-1 p-0.3">
          <div class="w-10 h-10 ml-5">
            <img
                :src="character.base64Image"
                class="w-full h-full scale-135 mt-2"
                :alt="character.name"
            >
          </div>
          <div class="w-[13%] -ml-2 mr-2 relative flex flex-col items-start h-auto flex-shrink-0 py-1">
            <h3 class="text-xs font-medium leading-tight block" style="font-family: 'Fira Sans Condensed', sans-serif;">
              {{ character.name }}
            </h3>
          </div>
          <div class="flex-1 min-w-0 mr-6">
            <p class="text-xs leading-tight whitespace-pre-line mr-4" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
              {{ character.ability }}
            </p>
          </div>
        </div>
      </div>

      <!-- Fabled -->
      <div v-if="fabled.length > 0" class="mb-4">
        <team-header team="fabled" />
        <div v-for="character in fabled" :key="character.id" class="flex items-center space-x-4 -m-1.5 ml-1 p-0.3">
          <div class="w-10 h-10 ml-5">
            <img
                :src="character.base64Image"
                class="w-full h-full scale-135 mt-2"
                :alt="character.name"
            >
          </div>
          <div class="w-[13%] -ml-2 mr-2 relative flex flex-col items-start h-auto flex-shrink-0 py-1">
            <h3 class="text-xs font-medium leading-tight block" style="font-family: 'Fira Sans Condensed', sans-serif;">
              {{ character.name }}
            </h3>
          </div>
          <div class="flex-1 min-w-0 mr-6">
            <p class="text-xs leading-tight whitespace-pre-line mr-4" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
              {{ character.ability }}
            </p>
          </div>
        </div>
      </div>

      <!-- Loric -->
      <div v-if="loric.length > 0" class="mb-4">
        <team-header team="loric" />
        <div v-for="character in loric" :key="character.id" class="flex items-center space-x-4 -m-1.5 ml-1 p-0.3">
          <div class="w-10 h-10 ml-5">
            <img
                :src="character.base64Image"
                class="w-full h-full scale-135 mt-2"
                :alt="character.name"
            >
          </div>
          <div class="w-[13%] -ml-2 mr-2 relative flex flex-col items-start h-auto flex-shrink-0 py-1">
            <h3 class="text-xs font-medium leading-tight block" style="font-family: 'Fira Sans Condensed', sans-serif;">
              {{ character.name }}
            </h3>
          </div>
          <div class="flex-1 min-w-0 mr-6">
            <p class="text-xs leading-tight whitespace-pre-line mr-4" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
              {{ character.ability }}
            </p>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import TeamHeader from "@/components/craft/pdf/print/TeamHeader.vue";

defineProps({
  travellers: {
    type: Array,
    default: () => []
  },
  fabled: {
    type: Array,
    default: () => []
  },
  loric: {
    type: Array,
    default: () => []
  }
})
</script>
