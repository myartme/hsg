<template>
  <div class="flex flex-col relative">
    <div class="flex-1">
      <!-- Djinn header -->
      <div v-if="djinn && jinxes && jinxes.length > 0" class="flex items-center">
        <div class="w-12 h-12 flex-shrink-0 relative">
          <img
              :src="djinn.base64Image"
              class="w-full h-full object-contain scale-130"
              alt="Djinn"
          />
          <!-- Compact badge -->
          <div v-if="djinnDisplayMode === 'compact'" class="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center" style="background-color: rgb(139, 115, 85);">
            <span class="text-white font-medium" style="font-family: 'Merriweather', serif; font-size: 11px; position: relative; top: -5.5px;">{{ jinxes.length }}</span>
          </div>
        </div>
        <div class="ml-2">
          <h3 class="text-sm font-medium" style="font-family: 'Fira Sans Condensed', sans-serif;">
            {{ djinn.name }}
          </h3>
          <p class="text-xs leading-tight" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
            {{ djinn.ability }}
          </p>
        </div>
      </div>

      <!-- Jinxes list (full mode) -->
      <table v-if="jinxes && jinxes.length > 0 && djinnDisplayMode === 'full'" class="w-full border-separate ml-8 mb-6" style="border-spacing: 0 12px;">
        <tbody>
          <tr v-for="(jinx, index) in jinxes" class="align-middle" :key="jinx.id">
            <td class="w-[48px] h-[38px] p-0">
              <img
                  :src="jinx.first.base64Image"
                  class="w-11 h-11 object-contain mx-auto scale-130"
                  :alt="'first'+index" />
            </td>
            <td class="w-[48px] h-[38px] p-0">
              <img
                  :src="jinx.second.base64Image"
                  class="w-11 h-11 object-contain mx-auto scale-130"
                  :alt="'second'+index" />
            </td>
            <td>
              <p class="text-xs leading-tight ml-2 mr-6" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
                {{ jinx.reason }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Bootlegger header -->
      <div v-if="bootlegger && bootleggerRules && bootleggerRules.length > 0" :class="['flex items-center', bootleggerDisplayMode === 'compact' ? 'mt-4' : '']">
        <div class="w-12 h-12 flex-shrink-0 relative">
          <img
              :src="bootlegger.base64Image"
              class="w-full h-full object-contain scale-130"
              alt="Bootlegger"
          />
          <!-- Compact badge -->
          <div v-if="bootleggerDisplayMode === 'compact'" class="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center" style="background-color: rgb(139, 115, 85);">
            <span class="text-white font-medium" style="font-family: 'Merriweather', serif; font-size: 11px; position: relative; top: -5.5px;">{{ bootleggerRules.length }}</span>
          </div>
        </div>
        <div class="ml-2">
          <h3 class="text-sm font-medium" style="font-family: 'Fira Sans Condensed', sans-serif;">
            {{ bootlegger.name }}
          </h3>
          <p class="text-xs leading-tight" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
            {{ bootlegger.ability }}
          </p>
        </div>
      </div>

      <!-- Bootlegger rules list (full mode) -->
      <div v-if="bootleggerRules && bootleggerRules.length > 0 && bootleggerDisplayMode === 'full'" class="ml-10 mt-3 pl-4 pb-2 border-l-2" style="border-color: rgb(139, 115, 85);">
        <div v-for="(rule, index) in bootleggerRules" :key="index" class="mb-2" style="color: rgb(0, 0, 0); font-family: 'Merriweather', serif; font-size: 15px;">
          {{ rule }}
        </div>
      </div>

      <!-- TFL compact mode -->
      <div v-if="tflDisplayMode === 'compact'">
        <!-- Travellers -->
        <div v-if="firstTraveller" class="flex items-center mt-4">
          <div class="w-12 h-12 flex-shrink-0 relative">
            <img
                :src="firstTraveller.base64Image"
                class="w-full h-full object-contain scale-130"
                alt="Traveller"
            />
            <div v-if="travellersCount > 1" class="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center" style="background-color: rgb(139, 115, 85);">
              <span class="text-white font-medium" style="font-family: 'Merriweather', serif; font-size: 11px; position: relative; top: -5.5px;">+{{ travellersCount - 1 }}</span>
            </div>
          </div>
          <div class="ml-2">
            <h3 class="text-sm font-medium" style="font-family: 'Fira Sans Condensed', sans-serif;">
              {{ firstTraveller.name }}
            </h3>
            <p class="text-xs leading-tight" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
              {{ firstTraveller.ability }}
            </p>
          </div>
        </div>
        <!-- Fabled -->
        <div v-if="firstFabled" class="flex items-center mt-4">
          <div class="w-12 h-12 flex-shrink-0 relative">
            <img
                :src="firstFabled.base64Image"
                class="w-full h-full object-contain scale-130"
                alt="Fabled"
            />
            <div v-if="fabledCount > 1" class="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center" style="background-color: rgb(139, 115, 85);">
              <span class="text-white font-medium" style="font-family: 'Merriweather', serif; font-size: 11px; position: relative; top: -5.5px;">+{{ fabledCount - 1 }}</span>
            </div>
          </div>
          <div class="ml-2">
            <h3 class="text-sm font-medium" style="font-family: 'Fira Sans Condensed', sans-serif;">
              {{ firstFabled.name }}
            </h3>
            <p class="text-xs leading-tight" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
              {{ firstFabled.ability }}
            </p>
          </div>
        </div>
        <!-- Loric -->
        <div v-if="firstLoric" class="flex items-center mt-4">
          <div class="w-12 h-12 flex-shrink-0 relative">
            <img
                :src="firstLoric.base64Image"
                class="w-full h-full object-contain scale-130"
                alt="Loric"
            />
            <div v-if="loricCount > 1" class="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center" style="background-color: rgb(139, 115, 85);">
              <span class="text-white font-medium" style="font-family: 'Merriweather', serif; font-size: 11px; position: relative; top: -5.5px;">+{{ loricCount - 1 }}</span>
            </div>
          </div>
          <div class="ml-2">
            <h3 class="text-sm font-medium" style="font-family: 'Fira Sans Condensed', sans-serif;">
              {{ firstLoric.name }}
            </h3>
            <p class="text-xs leading-tight" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
              {{ firstLoric.ability }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  jinxes: {
    type: Array,
    default: () => []
  },
  djinn: {
    type: Object,
    default: null
  },
  djinnDisplayMode: {
    type: String,
    default: 'full' // 'full' | 'compact'
  },
  bootlegger: {
    type: Object,
    default: null
  },
  bootleggerDisplayMode: {
    type: String,
    default: 'full' // 'full' | 'compact'
  },
  bootleggerRules: {
    type: Array,
    default: () => []
  },
  // TFL compact props
  tflDisplayMode: {
    type: String,
    default: 'full' // 'full' | 'compact'
  },
  travellersCount: {
    type: Number,
    default: 0
  },
  firstTraveller: {
    type: Object,
    default: null
  },
  fabledCount: {
    type: Number,
    default: 0
  },
  firstFabled: {
    type: Object,
    default: null
  },
  loricCount: {
    type: Number,
    default: 0
  },
  firstLoric: {
    type: Object,
    default: null
  }
})

</script>
