<template>
  <div :class="divClass">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info" />
    <div class="relative">
      <div class="flex flex-wrap gap-2 mb-2 select-none">
        <span
            v-for="(tag, index) in tags"
            @click="removeTag(index)"
            :key="index"
            :class="[
                'tag-theme',
                disabled ? 'cursor-not-allowed bg-[color:var(--color-disable-bg)]' : 'cursor-pointer'
            ]"
        >
          {{ tag }} <span v-if="!disabled" class="tag-close-theme">×</span>
        </span>
      </div>

      <div class="relative">
        <input
            v-model="input"
            @keydown.enter.prevent="addTag"
            :maxlength="maxlength"
            :disabled="tags.length >= maxTags || disabled"
            :class="[
              inputClass,
              { 'opacity-50 cursor-not-allowed': tags.length >= maxTags },
              { 'input-shake bg-[color:var(--color-bg-error)]': inputShake },
              'input-theme'
            ]"
            :placeholder="placeholderText(tags)"
        />
        <div :class="[
            'line-reached-info-theme',
            disabled ? 'text-[color:var(--color-disable-placeholder-text)]' : 'text-[color:var(--color-placeholder-text)]'
        ]">
          <span v-if="input.length">{{ input.length }} / {{ maxlength }}</span>
          <span v-else>{{ tags.length }} / {{ maxTags }} tokens</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME} from "@/constants/other";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const props = defineProps({
  label: String,
  value: {
    type: Array,
    default: () => []
  },
  maxlength: {
    type: Number,
    default: 50
  },
  maxTags: {
    type: Number,
    default: 20
  },
  divClass: String,
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  inputClass: {
    type: String,
    default: "rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm pr-16"
  },
  info: {
    type: String,
    default: ""
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

const tags = ref([...props.value])
const input = ref("")
const inputShake = ref(false);

const emits = defineEmits(['update:value'])
const placeholderText = ((tags) =>
    props.disabled ? 'Addition not available' : tags.length >= props.maxTags ? 'Limit reached' : 'Press Enter to add'
)

const addTag = () => {
  const value = input.value.trim()

  if (tags.value.includes(value)) {
    inputShake.value = true;
    setTimeout(() => {
      inputShake.value = false;
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME);
    return;
  }

  if (!value || tags.value.includes(value) || tags.value.length >= props.maxTags) return
  tags.value.push(value)
  input.value = ""
  emits('update:value', tags.value)
}

const removeTag = (index) => {
  if(props.disabled) return
  tags.value.splice(index, 1)
  emits('update:value', tags.value)
}

watch(() => props.value, (newVal) => {
  tags.value = [...newVal]
})
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