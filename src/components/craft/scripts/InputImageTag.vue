<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :info="info" />
    <div class="relative">
      <div class="flex flex-wrap gap-2 mb-2 select-none">
        <div
            v-for="(tag, index) in tags"
            :key="index"
            class="relative h-10 w-10"
        >
          <img :src="tag.image"
              :class="[
                  'h-full w-full border-1 rounded-md border-[color:var(--color-border)]',
                  disabled ? 'cursor-not-allowed bg-[color:var(--color-disable-bg)]' : 'cursor-pointer'
              ]"
               @click="removeTag(index)" />
          <span v-if="!disabled"
                class="absolute right-0 bottom-0 px-1 cursor-pointer text-[color:var(--color-error)] hover:text-[color:var(--color-button-hover-error)]"
                @click="removeTag(index)">×</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";
import {getImageFirstUrl} from "@/constants/other";

const props = defineProps({
  label: String,
  value: {
    type: Array,
    default: () => {}
  },
  divClass: String,
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  info: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const tags = ref([])
const emits = defineEmits(['update:value'])

const removeTag = (index) => {
  if(props.disabled) return
  tags.value.splice(index, 1)
  emits('update:value', tags.value)
}

watch(() => props.value, (newVal) => {
  tags.value = [...newVal]
}, {immediate:true})
</script>
<style>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
.input-shake {
  animation: shake 0.2s ease;
}
</style>