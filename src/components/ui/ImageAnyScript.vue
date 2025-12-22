<template>
  <cached-image :src="getImageFirstUrl(character)" :img-class="imgClass" alt="" />
</template>
<script setup>
import {getImageFirstUrl} from "@/constants/other";
import CachedImage from "@/components/ui/CachedImage.vue";

const props = defineProps({
  character: Object,
  imgClass: String
})
</script>
