<template>
  <div class="text-[color:var(--color-title-text)]">
    <p class="title-theme mb-3 mt-3 text-lg">{{ title }}</p>
    <label v-for="(item, key) in inputs" class="flex items-center space-x-2 mb-2 cursor-pointer accent-[color:var(--color-active)] hover:accent-[color:var(--color-hover-active)]">
      <input type="checkbox" :value="key" class="cursor-pointer" v-model="items">
      <span>{{ item }}</span>
    </label>
    <div class="gap-3 mt-4 space-x-4">
      <button @click="apply"
              class="px-4 py-1 rounded-md cursor-pointer bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]">Apply</button>
      <button @click="reset"
              class="px-4 py-1 rounded-md cursor-pointer ml-auto w-30 bg-[color:var(--color-placeholder-text)] hover:bg-[color:var(--color-hover-bg)]">{{ resetFilterTitle }}</button>
    </div>
  </div>
</template>
<script setup>
import {computed, ref, watch} from "vue";

const props = defineProps({
  title: String,
  value: Array,
  inputs: Object
})

const items = ref([])
const maxLength = ref(Object.keys(props.inputs).length)
const emits = defineEmits(['onUpdateItems'])
const resetFilterTitle = computed(() =>
     items.value.length === maxLength.value ? 'Uncheck all' : 'Check all'
)

function apply(){
  emits('onUpdateItems', items.value)
}
function reset(){
  if(items.value.length === maxLength.value){
    items.value = []
  } else {
    items.value = Object.keys(props.inputs)
  }
}

watch(() => props.value, (val) => {
  items.value = val
}, {immediate: true})
</script>