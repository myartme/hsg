<template>
  <div ref="container"
      :class="[
          'relative',
          containerClass,
          { 'bg-[color:var(--color-bg)] border-[color:var(--color-border)]' : isBackgroundEnabled },
          { 'overflow-hidden pointer-events-none select-none': isLocked && lockedSource !== name }
      ]">
    <sticky-actions v-if="hasSticky" :is-show="isShowSticky">
      <slot name="sticky" />
    </sticky-actions>
    <div v-if="hasHeader" :class="[
        headerClass,
        'title-theme'
    ]">
      <slot name="header" />
    </div>
    <div v-if="hasContent" :class="contentClass">
      <slot name="content" />
    </div>
    <div v-if="isLocked && lockedSource !== name" class="absolute inset-0 z-50 pointer-events-auto top-0 left-0 w-full bg-black/60" :style="`height: ${height}px`" />
  </div>
</template>
<script setup>
import StickyActions from "@/components/ui/StickyActions.vue";
import {onBeforeUnmount, onMounted, ref, useSlots} from "vue";
import {useIndexStore} from "@/store";
import {storeToRefs} from "pinia";

const props = defineProps({
  name: String,
  isShowSticky: Boolean,
  isBackgroundEnabled: {
    type: Boolean,
    default: true
  },
  containerClass: {
    type: String,
    default: "flex-1 border-2 rounded-md p-4 shadow overflow-auto relative max-h-[calc(100vh-40px)]"
  },
  headerClass: {
    type: String,
    default: "flex items-center gap-2 p-5"
  },
  contentClass: {
    type: String,
    default: "p-10 pt-0"
  }
})

const indexStore = useIndexStore()
const { isLocked, lockedSource } = storeToRefs(indexStore)
const slots = useSlots()
const hasSticky = !!slots.sticky
const hasHeader = !!slots.header
const hasContent = !!slots.content
const container = ref()
const height = ref(0)
const observer = ref()

onMounted(() => {
  if (container.value) {
    observer.value = new ResizeObserver(() => {
      height.value = container.value.scrollHeight
    })
    observer.value.observe(container.value)
  }
})


onBeforeUnmount(() => {
  if (observer && container.value) {
    observer.value.unobserve(container.value)
    observer.value.disconnect()
  }
})
</script>