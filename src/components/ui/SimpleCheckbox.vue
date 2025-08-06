<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info"
        :different="different"
        :model-length="model?.length" />
    <input
        id="my-checkbox"
        type="checkbox"
        v-model="model"
        :disabled="disabled"
        :class="[
            inputClass,
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        ]"
    />
  </div>
</template>
<script setup>
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const model = defineModel('value')
const props = defineProps({
  label: String,
  value: Boolean,
  divClass: {
    type: String,
    default: "flex items-center space-x-2"
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold"
  },
  inputClass: {
    type: String,
    default: "h-4 w-4 mb-1.5 rounded accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]"
  },
  info: {
    type: String,
    default: "",
  },
  different: {
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
</script>