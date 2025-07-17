<template>
  <td class="w-[48px] h-[48px] p-0 align-middle" style="padding-right: 2px;">
    <img
        v-if="item"
        :src="item.base64Image"
        :alt="item.name"
        class="w-12 h-12 object-contain mx-auto"
    />
  </td>
  <td class="align-middle" style="width: calc(50% - 48px - 6px); padding-left: 2px; padding-right: 12px;">
    <p v-if="item" class="text-xxs leading-tight mb-3" style="color: rgb(100,25,32);">
      {{ item.name }}
    </p>
  </td>
</template>
<script setup>
const props = defineProps({
  item: Object
})
</script>