<template>
  <action-button
      v-if="value?.isEqual === false"
      icon="undo"
      icon-size="w-5 h-5"
      :tooltip="`Reset to default value for the script.<br>Current script value: <strong>${value.scriptValue}</strong><br>Default value: <strong>${value.generalValue}</strong>`"
      icon-hover-color="group-hover:fill-[color:var(--color-button-error)]"
      button-class="mb-1.5 ml-2 w-7 h-7"
      @click.stop="$emit('valueUpdate', value.generalValue)"
  />
</template>
<script setup lang="ts">
import ActionButton from "@/components/ui/ActionButton.vue";

defineProps({
  value: Object
})
const emits = defineEmits(['valueUpdate'])
</script>