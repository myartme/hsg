<template>
  <div :class="divClass">
    <div class="flex items-center space-x-1">
      <label class="title-theme">{{ label }}</label>
      <info-tooltip v-if="required" :text="required" />
      <info-tooltip v-if="tooltip" :text="tooltip" />
    </div>
    <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="value"
        :disabled="disabled"
        @input="$emit('update:value', +$event.target.value)"
        :class="[
            inputClass,
            'w-full accent-[color:var(--color-list-element)]',
            { 'opacity-50 cursor-not-allowed': disabled }
        ]"
    />
    <span class="min-w-[5rem] text-right text-sm text-[color:var(--color-text)]">
      {{ value }} ms
    </span>
  </div>
</template>
<script setup>
import InfoTooltip from "@/components/ui/InfoTooltip.vue";

const props = defineProps({
  label: String,
  value: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 10
  },
  step: {
    type: Number,
    default: 1
  },
  tooltip: String,
  required: String,
  disabled: {
    type: Boolean,
    default: false
  },
  divClass: {
    type: String,
    default: "flex space-x-2"
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold"
  },
  inputClass: {
    type: String,
    default: "h-4 w-4 rounded"
  },
})
</script>