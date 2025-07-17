<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info"
        :model-length="model?.length" />
    <div class="relative">
      <textarea
          :class="[
              textareaClass,
              'input-theme'
          ]"
          v-model="model"
          :maxlength="maxlength"
          :rows="rows"
          :disabled="disabled"
      ></textarea>
      <div :class="[
          'multiline-reached-info-theme',
          disabled ? 'text-[color:var(--color-disable-placeholder-text)]' : 'text-[color:var(--color-placeholder-text)]'
      ]">{{ model?.length || 0 }} / {{ maxlength }}</div>
    </div>
  </div>
</template>
<script setup>
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const model = defineModel('value')
const props = defineProps({
  label: String,
  value: String | Number,
  maxlength: {
    type: Number,
    default: 200
  },
  rows: {
    type: String,
    default: "4"
  },
  divClass: {
    type: String,
    default: "resize-none"
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  textareaClass: {
    type: String,
    default: "rounded-md px-3 py-1 w-full focus:outline-none pr-16 resize-none"
  },
  info: {
    type: String,
    default: "",
  },
  required: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>