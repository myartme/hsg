<template>
  <div class="flex items-center space-x-1 mb-1">
    <label :class="[
          labelClass,
          'title-theme'
      ]">{{ label }}</label>
    <div class="flex items-center pb-1.5 pl-1 space-x-2">
      <info-tooltip v-if="required && modelLength === 0" :text="required" icon="alert" icon-size="w-5 h-5" icon-color="fill-[color:var(--color-error)]" />
      <info-tooltip v-if="info" :text="info" icon="info" icon-size="w-5 h-5" />
      <info-tooltip v-if="different" :text="different" icon="different" icon-size="w-5 h-5" icon-color="fill-[color:var(--color-error)]" />
      <info-tooltip v-if="tooltip" :text="tooltip" :icon="tooltipIcon" icon-size="w-5 h-5" :icon-color="tooltipColor" />
    </div>
  </div>
</template>
<script setup>
import InfoTooltip from "@/components/ui/InfoTooltip.vue";

const props = defineProps({
  label: String,
  modelLength: Number,
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  required: {
    type: String,
    default: "",
  },
  info: {
    type: String,
    default: "",
  },
  different: {
    type: String,
    default: "",
  },
  tooltip: {
    type: String,
    default: "",
  },
  tooltipIcon: {
    type: String,
    default: "",
  },
  tooltipColor: {
    type: String,
    default: "",
  },
})
</script>