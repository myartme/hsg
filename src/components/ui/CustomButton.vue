<template>
  <div class="relative">
    <tooltip v-if="tooltip"
             :triggers="['hover', 'focus', 'click']"
             placement="top"
             :auto-hide="true"
             :delay="{ show: tooltipDelay.buttonShow, hide: tooltipDelay.buttonHide }"
    >
      <template #default>
        <button
            :class="[
                wrapperClass,
                'group',
                { 'bg-[color:var(--color-bg-button-pressed)]' : isPressed },
                isDisable ? 'cursor-not-allowed' : 'cursor-pointer'
            ]"
            @click="handleTooltip"
            @blur="handleTooltip">
            <icon-element :name="icon" :size="iconSize" :color="iconColor" />
          <slot name="transition" />
        </button>
      </template>
      <template #popper>
        <div v-html="tooltip"></div>
      </template>
    </tooltip>
    <button v-else :class="[
        wrapperClass,
        { 'bg-[color:var(--color-bg-button-pressed)]' : isPressed },
        isDisable ? 'cursor-not-allowed' : 'cursor-pointer'
    ]">
      <icon-element :name="icon" :size="iconSize" :color="iconColor" />
      <slot name="transition" />
    </button>
  </div>
</template>
<script setup>
import {Tooltip} from "floating-vue";
import {useOptionsStore} from "@/store/options";
import {storeToRefs} from "pinia";
import IconElement from "@/components/ui/IconElement.vue";

const props = defineProps({
  icon: String,
  iconSize: String,
  isPressed: {
    type: Boolean,
    default: false
  },
  isDisable: {
    type: Boolean,
    default: false
  },
  iconColor: {
    type: String,
    default: 'fill-[color:var(--color-text)] group-hover:fill-[color:var(--color-border)]'
  },
  tooltip: {
    type: String,
    default: "",
  },
  wrapperClass: {
    type: String,
    default: ""
  }
})

const optionsStore = useOptionsStore()
const { tooltipDelay } = storeToRefs(optionsStore)

function handleTooltip(e) {
  e.currentTarget.blur()
}
</script>