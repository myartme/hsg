<template>
  <div class="mx-10">
    <!-- Header with player counts -->
    <div class="flex items-baseline pb-2" style="border-color: rgb(180, 160, 140);">
      <div class="w-24 text-base font-medium relative top-1.5" style="color: rgb(120, 100, 80); font-family: 'Rubik', sans-serif;">Players</div>
      <div class="flex-1 flex">
        <div v-for="n in playerCounts" :key="'p'+n"
             class="flex-1 text-center text-2xl tracking-wide"
             style="color: rgb(120, 100, 80); font-family: 'Cormorant Garamond', serif;">
          {{ n === 15 ? '15+' : n }}
        </div>
      </div>
    </div>
    <div class="mt-3 mb-0 border-t" style="border-color: rgb(180, 160, 140);"></div>

    <!-- Good team -->
    <div class="flex items-center py-1.5">
      <div class="w-24 text-base font-medium relative top-1.5" style="color: rgb(0, 100, 172); font-family: 'Rubik', sans-serif;">
        Townsfolk
      </div>
      <div class="flex-1 flex">
        <div v-for="(count, index) in townsfolkCounts" :key="'t'+index"
             class="flex-1 text-center text-2xl font-semibold"
             style="color: rgb(0, 100, 172); font-family: 'Cormorant Garamond', serif;">
          {{ count }}
        </div>
      </div>
    </div>

    <div class="flex items-center py-1.5">
      <div class="w-24 text-base font-medium relative top-1.5" style="color: rgb(0, 100, 172); font-family: 'Rubik', sans-serif;">
        Outsiders
      </div>
      <div class="flex-1 flex">
        <div v-for="(count, index) in outsiderCounts" :key="'o'+index"
             class="flex-1 text-center text-2xl font-semibold"
             style="color: rgb(0, 100, 172); font-family: 'Cormorant Garamond', serif;">
          {{ count }}
        </div>
      </div>
    </div>

    <!-- Separator -->
    <div class="mt-5 mb-0 border-t" style="border-color: rgb(200, 185, 170);"></div>

    <!-- Evil team -->
    <div class="flex items-center py-1.5">
      <div class="w-24 text-base font-medium relative top-1.5" style="color: rgb(118, 11, 13); font-family: 'Rubik', sans-serif;">
        Minions
      </div>
      <div class="flex-1 flex">
        <div v-for="(count, index) in minionCounts" :key="'m'+index"
             class="flex-1 text-center text-2xl font-semibold"
             style="color: rgb(118, 11, 13); font-family: 'Cormorant Garamond', serif;">
          {{ count }}
        </div>
      </div>
    </div>

    <div class="flex items-center py-1.5">
      <div class="w-24 text-base font-medium relative top-1.5" style="color: rgb(118, 11, 13); font-family: 'Rubik', sans-serif;">
        Demons
      </div>
      <div class="flex-1 flex">
        <div v-for="(count, index) in demonCounts" :key="'d'+index"
             class="flex-1 text-center text-2xl font-semibold"
             style="color: rgb(118, 11, 13); font-family: 'Cormorant Garamond', serif;">
          {{ count }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const playerCounts = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const townsfolkCounts = [3, 3, 5, 5, 5, 7, 7, 7, 9, 9, 9]
const outsiderCounts = [0, 1, 0, 1, 2, 0, 1, 2, 0, 1, 2]
const minionCounts = [1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3]
const demonCounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
</script>
