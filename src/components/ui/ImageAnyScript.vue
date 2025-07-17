<template>
  <img v-if="officialIcons" :src="`images/icons/icon_${character.id}.svg`" :class="imgClass" alt="" />
  <img v-else-if="Array.isArray(character.image)" :src="character.image[0]" :class="imgClass" alt="" />
  <img v-else :src="character.image" :class="imgClass" alt="" />
</template>
<script setup>
const props = defineProps({
  character: Object,
  imgClass: String,
  officialIcons: {
    type: Boolean,
    default: false
  }
})
</script>