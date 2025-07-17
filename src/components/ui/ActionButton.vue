<template>
  <custom-button
      :icon="icon"
      :tooltip="tooltip"
      :wrapper-class="localWrapperClass + ' ' + buttonClass + ' ' + localButtonColor + ' ' + (isCircleType ? 'rounded-full' : 'rounded-lg')"
      :icon-size="iconSize"
      :icon-color="localIconColor"
      :is-disable="isDisable"
      @click="handleClick" >
    <template #transition>
      <transition name="fade-check">
        <svg
            v-if="showCheck"
            class="absolute top-0 left-0 w-10 h-10 pointer-events-none"
            viewBox="0 0 52 52"
        >
          <path class="checkmark" fill="none" stroke="#22c55e" stroke-width="5" d="M14 27l10 10 15-20" />
        </svg>
      </transition>
      <transition name="fade-check">
        <svg
            v-if="showCross"
            class="absolute top-0 left-0 w-10 h-10 pointer-events-none"
            viewBox="0 0 52 52"
        >
          <path class="crossmark-1" fill="none" stroke="#ef4444" stroke-width="5" d="M16 16 L36 36" />
          <path class="crossmark-2" fill="none" stroke="#ef4444" stroke-width="5" d="M36 16 L16 36" />
        </svg>
      </transition>
    </template>
  </custom-button>
</template>
<script setup>
import {computed, ref} from 'vue'
import CustomButton from "@/components/ui/CustomButton.vue";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME} from "@/constants/other";

const props = defineProps({
  icon: String,
  iconSize: String,
  iconColor: String,
  handle: Function,
  isCircleType: {
    type: Boolean,
    default: true
  },
  isShowEffect: {
    type: Boolean,
    default: false
  },
  isDisable: {
    type: Boolean,
    default: false
  },
  tooltip: {
    type: String,
    default: "",
  },
  buttonClass: String,
  buttonColor: String,
  wrapperClass: String
})
const showCheck = ref(false)
const showCross = ref(false)
const localWrapperClass = computed(() => props.wrapperClass || "flex items-center justify-center border-2 select-none")
const localIconColor = computed(() => props.iconColor || "fill-[color:var(--color-text)] hover:fill-[color:var(--color-border)]")
const localButtonColor = computed(() => props.buttonColor || "border-[color:var(--color-text)] hover:border-[color:var(--color-border)]")

async function handleClick() {
  try {
    const result = await props.handle?.()

    if(result){
      if(props.isShowEffect) {
        playEffect(showCheck)
      }
    }
  } catch {
    if(props.isShowEffect){
      playEffect(showCross)
    }
  }
}
function playEffect(ref) {
  ref.value = true
  setTimeout(() => {
    ref.value = false
  }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
}
</script>
<style scoped>
.checkmark {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: draw-check 0.5s ease forwards;
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}

.crossmark-1 {
  stroke-dasharray: 28;
  stroke-dashoffset: 28;
  animation: draw-cross-1 0.5s ease forwards;
}

@keyframes draw-cross-1 {
  to {
    stroke-dashoffset: 0;
  }
}

.crossmark-2 {
  stroke-dasharray: 28;
  stroke-dashoffset: 28;
  animation: draw-cross-2 0.5s ease forwards;
  animation-delay: 0.3s;
  animation-fill-mode: forwards;
}

@keyframes draw-cross-2 {
  to {
    stroke-dashoffset: 0;
  }
}

.fade-check-enter-active,
.fade-check-leave-active {
  transition: opacity 0.5s ease;
}
.fade-check-enter-from,
.fade-check-leave-to {
  opacity: 0;
}
.fade-check-enter-to,
.fade-check-leave-from {
  opacity: 1;
}
</style>