<template>
  <div class="mb-1 cursor-pointer">
    <div :class="[
        'flex border-2 items-center gap-2 rounded transition-all duration-200 p-1.5 border-[color:var(--color-border)]',
        isCurrent
          ? 'bg-[color:var(--color-list-element)] hover:bg-[color:var(--color-hover-active)]'
          : 'bg-[color:var(--color-bg)] hover:bg-[color:var(--color-hover-bg)]'
    ]">
      <image-any-script :character="element" img-class="w-10 h-10 rounded shrink-0" />
      <div class="flex flex-col flex-1">
        <div class="font-medium text-xs leading-tight truncate title-theme">{{ name }}</div>
        <div class="text-xs leading-snug line-clamp-1 text-theme">{{ ability }}</div>
      </div>
      <div class="text-xs min-w-[1.5rem] text-right mr-3 text-theme">{{ value }}</div>
    </div>
  </div>
</template>
<script setup>
import ImageAnyScript from "@/components/ui/ImageAnyScript.vue";

const props = defineProps({
  name: String,
  ability: String,
  value: [Number, String],
  element: Object,
  isCurrent: Boolean
})
</script>