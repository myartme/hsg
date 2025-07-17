<template>
  <div class="flex items-center p-2">
    <div class="flex-grow border-t" style="border: 1px solid rgb(229, 231, 235);"></div>
    <span class="text-xxs px-10 border rounded-full relative overflow-visible" style="border: 1px solid rgb(229, 231, 235); color: rgb(55, 65, 81);">
      <span class="absolute -top-1.5 left-1/2 -translate-x-1/2">
        {{ title }}
      </span>&nbsp;
    </span>
    <div class="flex-grow-0 border-t w-[5%]" style="border: 1px solid rgb(229, 231, 235);"></div>
  </div>
</template>
<script setup>
const props = defineProps({
  title: String
})
</script>