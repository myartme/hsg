<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :info="info" />
    <div class="relative">
      <div class="flex flex-wrap gap-2 mb-2 select-none">
        <span
            v-for="(tag, index) in tags"
            @click="removeTag(index)"
            :key="index"
            :class="[
                'tag-theme',
                { 'text-theme' : !tag.customColor },
                disabled ? 'cursor-not-allowed bg-[color:var(--color-disable-bg)]' : 'cursor-pointer'
            ]"
            :style="tag.customColor ? { color: tag.customColor } : {}"
        >
          {{ tag.title }} <span v-if="!disabled" class="tag-close-theme">×</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

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