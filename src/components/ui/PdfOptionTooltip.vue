<template>
  <tooltip
      :triggers="['hover', 'focus']"
      placement="top"
      :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
      :popper-class="'pdf-option-tooltip'"
  >
    <template #default>
      <div class="cursor-pointer">
        <icon-element name="info" size="w-5 h-5" />
      </div>
    </template>
    <template #popper>
      <div class="flex flex-col gap-4 p-2">
        <div class="flex flex-col items-center">
          <span class="text-sm font-medium mb-2">{{ leftLabel }}</span>
          <img :src="leftImageBase64" :alt="leftLabel" class="rounded" />
        </div>
        <div class="flex flex-col items-center">
          <span class="text-sm font-medium mb-2">{{ rightLabel }}</span>
          <img :src="rightImageBase64" :alt="rightLabel" class="rounded" />
        </div>
      </div>
    </template>
  </tooltip>
</template>
<script setup>
import {ref, watch} from "vue";
import {Tooltip} from "floating-vue";
import {useOptionsStore} from "@/store/options";
import {storeToRefs} from "pinia";
import IconElement from "@/components/ui/IconElement.vue";
import {getBase64Image} from "@/store";

const props = defineProps({
  leftLabel: {
    type: String,
    required: true,
  },
  leftImage: {
    type: String,
    required: true,
  },
  rightLabel: {
    type: String,
    required: true,
  },
  rightImage: {
    type: String,
    required: true,
  }
})

const optionsStore = useOptionsStore()
const { tooltipDelay } = storeToRefs(optionsStore)

const leftImageBase64 = ref('')
const rightImageBase64 = ref('')

watch(() => props.leftImage, async (newVal) => {
  if (newVal) {
    leftImageBase64.value = newVal.startsWith('data:') ? newVal : await getBase64Image(newVal)
  }
}, { immediate: true })

watch(() => props.rightImage, async (newVal) => {
  if (newVal) {
    rightImageBase64.value = newVal.startsWith('data:') ? newVal : await getBase64Image(newVal)
  }
}, { immediate: true })
</script>
<style>
.pdf-option-tooltip {
  max-width: none !important;
}
.pdf-option-tooltip .v-popper__inner {
  min-width: 620px;
  max-width: none !important;
  max-height: none !important;
}
.pdf-option-tooltip img {
  width: 600px !important;
  height: auto !important;
  max-width: none !important;
  max-height: none !important;
}
</style>
