<template>
  <div class="fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center z-50">
    <div class="rounded-2xl shadow-lg p-5 w-150 text-center bg-[color:var(--color-bg)]">
      <h2 class="text-xl font-semibold mb-10 title-theme">{{ title }}</h2>
      <p class="mb-10 text-[color:var(--color-text)]">{{ description }}</p>
      <div class="flex justify-center gap-4">
        <button
            @click="$emit('cancel')"
            class="px-4 py-2 rounded-md cursor-pointer text-[color:var(--color-text)] bg-[color:var(--color-border)] hover:bg-[color:var(--color-hover-bg)]"
        >
          Cancel
        </button>
        <button
            @click="$emit('confirm')"
            class="px-4 py-2 rounded-md cursor-pointer text-[color:var(--color-text)] bg-[color:var(--color-button-error)] hover:bg-[color:var(--color-button-hover-error)]"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String
})
defineEmits(['confirm', 'cancel'])
</script>