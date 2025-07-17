<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="pl-10 pr-10 pb-5 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative bg-[color:var(--color-bg)] border-[color:var(--color-border)]">
      <div class="sticky top-0 z-10 -mr-1 -ml-1 mb-2 pt-4 pb-2 px-6 border-b flex items-center justify-between bg-[color:var(--color-bg)] border-[color:var(--color-border)]">
        <h2 class="text-xl font-bold title-theme">
          <slot name="header" />
        </h2>
        <input v-if="isInputVisible"
               :value="inputValue"
               @change="$emit('onInputChange', $event)"
               type="number"
               @keydown.enter="(e) => e.target.blur()"
               :class="['rounded-md px-3 py-2 h-10 w-1/2 focus:outline-none shadow-sm border-2 focus:border-[color:var(--color-active)]',
              isDisabled ? 'cursor-not-allowed text-[color:var(--color-text)] border-[color:var(--color-border)] bg-[color:var(--color-bg)]' : 'text-[color:var(--color-text)] border-[color:var(--color-border)] g-[color:var(--color-bg)]']"/>
        <button
            class="ml-4 select-none cursor-pointer text-[color:var(--color-text)]"
            @click="$emit('close')"
        >✕</button>
      </div>
      <slot name="content" />
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  isInputVisible: Boolean,
  isDisabled: Boolean,
  inputValue: [String, Number]
})
</script>
