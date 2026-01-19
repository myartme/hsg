<template>
  <div :class="['inline-flex flex-col items-center', shiftClass]">
    <!-- Горизонтальная надпись сверху -->
    <h2 v-if="hasRoles"
        :class="['text-xl uppercase whitespace-nowrap tracking-[0.15em] mb-5', displayMode === 'compact' ? 'self-center' : 'self-start ml-6']"
        style="color: rgb(100,25,32); font-family: 'Forum', serif; font-weight: 700;">
      {{ title }}
    </h2>
    <table class="border-separate border-spacing-y-0">
      <tbody>
      <tr v-for="role in night" :key="role.id" class="align-middle h-[38px]">
        <td class="w-[48px] h-[38px] p-0">
          <!-- Dusk -->
          <img
              v-if="role.id === 'pdf_dusk'"
              class="w-8 h-8 object-contain mx-auto scale-120"
              :src="duskImg"
              alt="Dusk"
          />
          <!-- Dawn -->
          <img
              v-else-if="role.id === 'pdf_dawn'"
              class="w-8 h-8 object-contain mx-auto scale-120"
              :src="dawnImg"
              alt="Dawn"
          />
          <!-- Minion info -->
          <img
              v-else-if="role.id === 'pdf_minion_info'"
              class="w-8 h-8 object-contain mx-auto scale-130"
              :src="minioninfoImg"
              alt="Minion info"
          />
          <!-- Demon info -->
          <img
              v-else-if="role.id === 'pdf_demon_info'"
              class="w-8 h-8 object-contain mx-auto scale-130"
              :src="demoninfoImg"
              alt="Demon info"
          />
          <!-- Обычная роль -->
          <img
              v-else
              class="w-11 h-11 object-contain mx-auto scale-130"
              :src="role.base64Image"
              :alt="role.name"
          />
        </td>
        <td v-if="displayMode === 'full'" class="h-[38px] p-0 pl-1">
          <h3 class="text-xs font-medium mb-3" style="font-family: 'Fira Sans Condensed', sans-serif;">
            {{ getRoleName(role) }}
          </h3>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import duskImg from '/images/elements/pdf/dusk.png'
import dawnImg from '/images/elements/pdf/dawn.png'
import minioninfoImg from '/images/elements/pdf/minioninfo.png'
import demoninfoImg from '/images/elements/pdf/demoninfo.png'

const props = defineProps({
  night: Array,
  title: String,
  displayMode: {
    type: String,
    default: 'full' // 'full' | 'compact'
  },
  compactShift: {
    type: String,
    default: 'none' // 'left' | 'right' | 'none'
  }
})

const hasRoles = computed(() => props.night && props.night.length > 0)

const shiftClass = computed(() => {
  if (props.displayMode !== 'compact') return ''
  if (props.compactShift === 'left') return '-ml-4'
  if (props.compactShift === 'right') return '-mr-4'
  return ''
})

const specialNames = {
  'pdf_dusk': 'Dusk',
  'pdf_dawn': 'Dawn',
  'pdf_minion_info': 'Minion info',
  'pdf_demon_info': 'Demon info'
}

function getRoleName(role) {
  return specialNames[role.id] || role.name
}

</script>