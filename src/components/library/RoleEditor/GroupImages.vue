<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="(item, i) in inputValues" :key="i"
           class="flex flex-col items-start space-y-2">
        <simple-input
            v-model:value="inputValues[i]"
            :label="getLabel(i)"
            type="text"
            div-class="mb-4 mt-3"
            :disabled="disabled"
            @change="$emit('update:value', inputValues.length === 1 ? [...inputValues[0]] : [...inputValues])"
            @keydown.enter="(e) => e.target.blur()"
            :maxlength="maxLength" />
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
import {computed, ref, watch} from "vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

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

const maxValue = computed(() => {
  if(props.teamName === 'fabled') return 1
  if(props.teamName === 'traveller') return 3
  return 2
})
const inputValues = ref()
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

watch(() => props.value, (newVal) => {
  inputValues.value = Array.isArray(newVal) ? [...newVal] : [newVal]
})
watch(maxValue, (val) => {
  const values = Array.isArray(props.value) ? props.value : [props.value]
  inputValues.value = [...values, "", "", ""].slice(0, val)
}, {immediate: true})
</script>