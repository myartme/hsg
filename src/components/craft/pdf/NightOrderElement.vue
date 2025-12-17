<template>
  <div class="w-[38px] h-[38px] flex items-center justify-center cursor-pointer ">
    <img v-if="isDefaultElement"
         :src="`/images/elements/pdf/${value}.png`"
         class="w-7 h-7 object-contain mx-auto scale-130"
         :alt="value"
    >
    <img v-else
         :src="value"
         class="w-11 h-11 object-contain mx-auto scale-130"
         :alt="value" />
  </div>
</template>
<script setup>
const props = defineProps({
  value: String,
  isDefaultElement: Boolean,
})
</script>