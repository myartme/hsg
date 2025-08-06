<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="(item, i) in inputValues" :key="i" class="flex flex-col items-start">
        <div class="relative w-full">
          <simple-input
              v-model:value="inputValues[i]"
              :label="getLabel(i)"
              type="text"
              div-class="mb-4 mt-3"
              :input-class="('rounded-md px-2 py-2 h-10 w-full focus:outline-none form-input ' + (disabled ? 'pr-17' : 'pr-25'))"
              :disabled="disabled"
              @change="action()"
              @keydown.enter="(e) => e.target.blur()"
              :maxlength="maxLength" />
          <div v-if="inputValues[i]?.length > 0 && !disabled" class="absolute right-17 bottom-6 w-6 h-6 flex items-center justify-center rounded transition">
            <action-button
                icon="cross"
                icon-size="w-4 h-4"
                icon-color="fill-[color:var(--color-error)]"
                icon-hover-color="group-hover:fill-[color:var(--color-button-error)]"
                button-class="w-7 h-7"
                @click.stop="action(i)" />
          </div>
        </div>
        <img
            v-if="item"
            :src="item"
            class="w-26 h-26 object-cover rounded mx-auto"
            :alt="getLabel(i)"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import {ref, watch} from "vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import {getImageArray} from "@/constants/other";

const props = defineProps({
  label: String,
  value: [String, Array],
  teamName: String,
  divClass: {
    type: String,
    default : ""
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  inputClass: {
    type: String,
    default: "border border-gray-300 rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm focus:ring-violet-500 form-input"
  },
  info: {
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

const emits = defineEmits(['update:value'])

const inputValues = ref([])
const maxLength = 250

function getLabel(index){
  if(index === 0){
    return 'Regular'
  }
  if(props.teamName === 'townsfolk' || props.teamName === 'outsider'){
    if(index === 1) return 'Evil'
  }
  if(props.teamName === 'minion' || props.teamName === 'demon'){
    if(index === 1) return 'Good'
  }
  if(props.teamName === 'traveller'){
    if(index === 1) return 'Good'
    if(index === 2) return 'Evil'
  }
}

function action(key = null){
  if(key !== null){
    inputValues.value[key] = ''
    inputValues.value = [...inputValues.value]
  }
  emits('update:value',[...inputValues.value])
}

watch(() => props.value, (newVal) => {
  inputValues.value = getImageArray(newVal)
}, {immediate: true})
</script>