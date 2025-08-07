<template>
  <div class="relative w-full" v-click-outside="() => isOpen = false">
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info"
        :model-length="model?.length" />

    <div
        :class="[
            'relative',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        ]"
        @click="toggleDropdown"
    >
      <div
          :class="[
          selectClass,
          'flex items-center justify-between',
          'rounded-md px-3 py-2',
          disabled
            ? 'input-disable-theme'
            : model === ''
              ? 'input-placeholder-theme'
              : 'input-theme',
        ]"
      >
        <span>{{ selectedLabel }}</span>
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      <transition name="fade">
        <ul
            v-if="isOpen"
            class="absolute z-50 mt-1 w-full border bg-[color:var(--color-bg)] border-[color:var(--color-border)] text-theme rounded-md max-h-60 overflow-auto"
        >
          <li
              v-for="(role, i) in list"
              :key="i"
              @click="selectOption(role)"
              class="px-4 py-2 bg-[color:var(--color-bg)] hover:bg-[color:var(--color-hover-bg)] cursor-pointer text-sm"
          >
            {{ role }}
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const model = defineModel('value')

const props = defineProps({
  label: String,
  defaultValue: {
    type: String,
    default: ""
  },
  list: {
    type: Array,
    default: () => []
  },
  divClass: {
    type: String,
    default: ""
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  selectClass: {
    type: String,
    default: "appearance-none block w-full h-10"
  },
  info: String,
  required: String,
  disabled: Boolean
})

const isOpen = ref(false)

function toggleDropdown() {
  if(props.disabled) return
  isOpen.value = !isOpen.value
}

function selectOption(role) {
  model.value = role
  isOpen.value = false
}

const selectedLabel = computed(() => {
  return model.value || props.defaultValue || "Select an option"
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>