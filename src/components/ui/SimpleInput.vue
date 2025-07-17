<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info"
        :different="different"
        :tooltip="tooltip"
        :tooltip-icon="tooltipIcon"
        :model-length="model?.length" />
    <div class="relative">
      <input
          :class="[
              inputClass,
              'input-theme',
              { 'input-theme-error': errored }
          ]"
          v-model="model"
          :type="type"
          :maxlength="maxlength"
          :placeholder="placeholder"
          :disabled="disabled"
      />
      <div v-if="type === 'text'"
           :class="[
               'line-reached-info-theme',
               disabled ? 'text-[color:var(--color-disable-placeholder-text)]' : 'text-[color:var(--color-placeholder-text)]'
           ]">
        {{ model?.length || 0 }} / {{ maxlength }}
      </div>
    </div>
    <p v-if="errored"
       class="text-xs mt-1 ml-1 text-[color:var(--color-button-error)]">
      {{ errorText }}
    </p>
  </div>
</template>
<script setup>
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const model = defineModel('value')
const props = defineProps({
  label: String,
  maxlength: {
    type: Number,
    default: 50
  },
  divClass: {
    type: String
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  inputClass: {
    type: [String, Array],
    default: "rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm form-input pr-16"
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
  placeholder: String,
  type: {
    type: String,
    default: "text"
  },
  disabled: {
    type: Boolean,
    default: false
  },
  errored: {
    type: Boolean,
    default: false
  },
  errorText: {
    type: String,
    default: ""
  }
})
</script>