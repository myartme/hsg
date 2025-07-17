<template>
  <tooltip
      :triggers="['hover', 'focus']"
      placement="top"
      :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
  >
    <template #default>
      <div class="cursor-pointer">
        <icon-element :name="icon" :size="iconSize" :color="iconColor" />
      </div>
    </template>
    <template #popper>
      <div v-html="text"></div>
    </template>
  </tooltip>
</template>
<script setup>
import {Tooltip} from "floating-vue";
import {useOptionsStore} from "@/store/options";
import {storeToRefs} from "pinia";
import IconElement from "@/components/ui/IconElement.vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "info"
  },
  iconSize: String,
  iconColor: String
})

const optionsStore = useOptionsStore()
const { tooltipDelay } = storeToRefs(optionsStore)
</script>