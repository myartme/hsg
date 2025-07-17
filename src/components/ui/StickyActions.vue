<template>
  <transition name="slide-fade">
    <div v-if="isShow"
         class="sticky top-0 z-30">
      <div class="absolute right-4 mt-4 rounded-lg p-4 flex gap-3 w-max border-2 bg-[color:var(--color-bg)] border-[color:var(--color-border)]">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isShow: Boolean,
})
</script>
<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  transform: translateX(150%);
  opacity: 0;
}
.slide-fade-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-fade-leave-to {
  transform: translateX(150%);
  opacity: 0;
}
</style>
