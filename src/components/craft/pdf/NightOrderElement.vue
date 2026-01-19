<template>
  <div class="w-[38px] h-[38px] flex items-center justify-center cursor-pointer ">
    <img v-if="isDefaultElement"
         :src="defaultImages[value]"
         class="w-7 h-7 object-contain mx-auto scale-130"
         :alt="value"
    >
    <cached-image v-else
         :src="value"
         img-class="w-11 h-11 object-contain mx-auto scale-130"
         :alt="value" />
  </div>
</template>
<script setup>
import CachedImage from "@/components/ui/CachedImage.vue";
import duskImg from '/images/elements/pdf/dusk.png'
import dawnImg from '/images/elements/pdf/dawn.png'
import minioninfoImg from '/images/elements/pdf/minioninfo.png'
import demoninfoImg from '/images/elements/pdf/demoninfo.png'

const props = defineProps({
  value: String,
  isDefaultElement: Boolean,
})

const defaultImages = {
  dusk: duskImg,
  dawn: dawnImg,
  minioninfo: minioninfoImg,
  demoninfo: demoninfoImg,
}
</script>