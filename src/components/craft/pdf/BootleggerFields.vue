<template>
  <div class="bootlegger-section">
    <simple-input-tag
        v-model:value="rules"
        :label="$t('scriptEditor.bootleggerRules')"
        :max-tags="10"
        :maxlength="250"
        :info="$t('scriptEditor.bootleggerRulesInfo')" />
    <simple-dropdown
        v-if="!isEmpty(bootleggerOptions)"
        class="bootlegger-dropdown"
        :label="$t('scriptEditor.bootleggerList')"
        :info="$t('scriptEditor.bootleggerListInfo')"
        div-class="mt-2 mb-2"
        v-model:value="selectedRule"
        :list="bootleggerOptions"
        :default-value="$t('scriptEditor.addBootlegger')" />
  </div>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import {useLibraryStore} from "@/store/library";
import SimpleInputTag from "@/components/ui/SimpleInputTag.vue";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import {isEmpty} from "lodash/lang";

const libraryStore = useLibraryStore()
const craftStore = useCraftStore()
const { bootlegger } = storeToRefs(libraryStore)
const { pdfMeta, pdfListWithParams, isEditingScript } = storeToRefs(craftStore)

const selectedRule = ref('')

// Работаем напрямую с pdfMeta.value.bootlegger через computed с геттером и сеттером
const rules = computed({
  get: () => pdfMeta.value.bootlegger || [],
  set: (value) => {
    if (!isEditingScript.value) {
      isEditingScript.value = true
    }
    pdfMeta.value.bootlegger = value
  }
})

const bootleggerOptions = computed(() => {
  const allOptions = Object.values(pdfListWithParams.value)
      .flat()
      .flatMap(el => bootlegger.value[el.team]?.find(boot => boot.id === el.id)?.rules || [])
  // Фильтруем пустые и уже добавленные
  return allOptions.filter(opt => opt && !rules.value.includes(opt))
})

watch(selectedRule, (newVal) => {
  if (newVal) {
    if (!rules.value.includes(newVal) && rules.value.length < 10) {
      rules.value = [...rules.value, newVal]
    }
    // Всегда сбрасываем после выбора
    selectedRule.value = ""
  }
})
</script>
<style scoped>
.bootlegger-section :deep(.mb-1) {
  margin-bottom: 0;
}

.bootlegger-dropdown :deep(> div:nth-child(2)) {
  margin-top: 0.5rem;
}
</style>
