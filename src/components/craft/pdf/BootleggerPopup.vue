<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   container-class="max-w-xl max-h-[90vh] overflow-visible"
                   @close="closeWindow">
    <template #header>
      <h2 class="text-xl font-bold title-theme">{{ $t('tooltips.bootleggerRules') }}</h2>
    </template>
    <template #content>
      <bootlegger-fields />
    </template>
  </popup-container>
</template>
<script setup>
import PopupContainer from "@/components/PopupContainer.vue";
import BootleggerFields from "@/components/craft/pdf/BootleggerFields.vue";

const props = defineProps({
  isOpen: Boolean
})

const emits = defineEmits(['update:isOpen'])

function closeWindow() {
  emits('update:isOpen', false)
}
</script>
