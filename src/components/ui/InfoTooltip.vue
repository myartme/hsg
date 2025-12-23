<template>
  <tooltip
      :triggers="['hover', 'focus']"
      placement="top"
      :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
  >
    <template #default>
      <div :class="['cursor-pointer', { 'hover:opacity-80': clickable }]" @click="handleClick">
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
  iconColor: String,
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick(event) {
  if (props.clickable) {
    emit('click', event)
  }
}

const optionsStore = useOptionsStore()
const { tooltipDelay } = storeToRefs(optionsStore)
</script>