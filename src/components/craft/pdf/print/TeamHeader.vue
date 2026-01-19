<template>
  <div :class="[
    'flex items-center w-full relative',
    compact ? 'mt-0.5 -mb-2' : 'mt-3 -mb-3'
  ]">
    <!-- Линия слева (основная) -->
    <div class="h-[1px]" :class="compact ? 'ml-2' : 'ml-10'" style="width: 82%;" :style="{ backgroundColor: lineColor }"></div>
    <!-- Шильдик -->
    <div
      class="px-2 rounded-full border tracking-[0.15em] uppercase whitespace-nowrap"
      style="font-size: 10px;"
      :style="{
        borderColor: lineColor,
        color: textColor,
        fontFamily: 'Rubik, sans-serif'
      }"
    >
      <span style="position: relative; top: -6.5px;">{{ teamName }}</span>
    </div>
    <!-- Линия справа (короткая) -->
    <div class="h-[1px]" :class="compact ? 'mr-2' : 'mr-10'" style="width: 8%;" :style="{ backgroundColor: lineColor }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  team: {
    type: String,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const teamConfig = {
  townsfolk: {
    name: 'Townsfolk',
    lineColor: 'rgb(139, 115, 85)',
    textColor: 'rgb(100, 80, 60)'
  },
  outsider: {
    name: 'Outsiders',
    lineColor: 'rgb(139, 115, 85)',
    textColor: 'rgb(100, 80, 60)'
  },
  minion: {
    name: 'Minions',
    lineColor: 'rgb(139, 115, 85)',
    textColor: 'rgb(100, 80, 60)'
  },
  demon: {
    name: 'Demons',
    lineColor: 'rgb(139, 115, 85)',
    textColor: 'rgb(100, 80, 60)'
  },
  traveller: {
    name: 'Travellers',
    lineColor: 'rgb(139, 115, 85)',
    textColor: 'rgb(100, 80, 60)'
  },
  fabled: {
    name: 'Fabled',
    lineColor: 'rgb(139, 115, 85)',
    textColor: 'rgb(100, 80, 60)'
  },
  loric: {
    name: 'Loric',
    lineColor: 'rgb(139, 115, 85)',
    textColor: 'rgb(100, 80, 60)'
  }
}

const config = computed(() => teamConfig[props.team] || teamConfig.townsfolk)
const teamName = computed(() => config.value.name)
const lineColor = computed(() => config.value.lineColor)
const textColor = computed(() => config.value.textColor)
</script>
