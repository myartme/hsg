<template>
  <div>
    <div class="fixed inset-0 z-40" @click="emit('close')"></div>
    <div class="absolute z-50 mt-1 w-80 rounded-md shadow-lg bg-[color:var(--color-bg)] border border-[color:var(--color-border)]"
         :style="{ top: position.top, left: position.left }"
         @click.stop>
      <div class="px-3 py-2 border-b border-[color:var(--color-border)]">
        <span class="font-semibold text-[color:var(--color-title-text)]">{{ fieldLabel }}</span>
      </div>
      <div class="py-1 max-h-60 overflow-y-auto">
        <div v-for="(item, index) in items"
             :key="index"
             class="px-3 py-2 cursor-pointer hover:bg-[color:var(--color-hover-bg)] transition-colors flex justify-between items-center gap-2"
             @click="selectItem(item)">
          <span class="text-sm text-[color:var(--color-placeholder-text)] shrink-0">
            {{ item.label }}
          </span>
          <span class="text-[color:var(--color-title-text)] font-medium truncate"
                :title="item.value || $t('scriptEditor.emptyValue')">
            {{ item.value || $t('scriptEditor.emptyValue') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  globalValue: {
    type: String,
    default: ''
  },
  fieldLabel: {
    type: String,
    default: ''
  },
  versionDifferences: {
    type: Array,
    default: () => []
  },
  position: {
    type: Object,
    default: () => ({ top: '100%', left: '0' })
  }
})

const emit = defineEmits(['select', 'close'])

const items = computed(() => {
  const result = [{
    label: t('scriptEditor.globalLabel'),
    value: props.globalValue,
    isGlobal: true
  }]

  props.versionDifferences.forEach(diff => {
    result.push({
      label: t('scriptEditor.versionLabel', { version: diff.version }),
      value: diff.value,
      isGlobal: false,
      version: diff.version
    })
  })

  return result
})

function selectItem(item) {
  emit('select', item)
}
</script>
