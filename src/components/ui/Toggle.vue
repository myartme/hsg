<template>
  <div :class="divClass">
    <div class="flex items-center space-x-1">
      <label for="my-checkbox" class="title-theme">{{ label }}</label>
      <info-tooltip v-if="required" :text="required" icon="alert" />
      <info-tooltip v-if="tooltip" :text="tooltip" class="pt-1" />
    </div>
    <div class="flex items-center space-x-3">
      <button
          :class="[
              inputClass,
              'relative inline-flex items-center h-6 w-11 rounded-full duration-200 focus:outline-none',
              value ? 'bg-[color:var(--color-list-element)]' : 'bg-[color:var(--color-border)]',
              { 'opacity-50 cursor-not-allowed': disabled }
          ]"
          :disabled="disabled"
          @click="toggle"
          role="switch"
          :aria-checked="value.toString()"
      >
        <span :class="[
            'inline-block h-4 w-4 transform rounded-full transition-transform duration-200 bg-[color:var(--color-bg)]',
            value ? 'translate-x-6' : 'translate-x-1'
        ]"
        ></span>
      </button>
    </div>
  </div>
</template>
<script setup>
import InfoTooltip from "@/components/ui/InfoTooltip.vue";

const props = defineProps({
  label: String,
  value: {
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
  tooltip: {
    type: String,
    default: "",
  },
  required: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:value'])

function toggle() {
  emit('update:value', !props.value)
}
</script>