<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info"
        :model-length="model?.length" />
    <div class="relative">
      <select
          id="role"
          v-model="model"
          :class="[
              selectClass,
              model === '' ? 'input-placeholder-theme' : 'input-theme'
          ]"
          :disabled="disabled"
      >
        <option disabled value="">{{ defaultValue }}</option>
        <option v-for="roleType in list" :key="roleType">{{ roleType }}</option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
            class="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
</template>
<script setup>
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const model = defineModel('value')
const props = defineProps({
  label: String,
  defaultValue: {
    type: String,
    default: ""
  },
  list: Array,
  divClass: {
    type: String
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  selectClass: {
    type: String,
    default: "appearance-none block w-full h-10 px-3 pr-10 py-2 rounded-md text-sm leading-5 focus:outline-none"
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