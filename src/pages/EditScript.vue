<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden relative">
    <full-character-list-craft />
    <preview-pdf />
    <result-generator class="absolute top-full pointer-events-none opacity-0" />
    <button-panel />
    <script-options-popup
        v-model:is-open="isOpenPdfOptions"
        :isBootleggersEnabled="isBootleggersEnabled" />
    <spinner v-if="isWaitingOperation"
             item-class="fixed inset-0 z-50 bg-black/60 pointer-events-auto flex justify-center items-center" size="w-20 h-20" />
  </div>
</template>

<script setup>
import FullCharacterListCraft from "@/components/craft/list/FullCharacterList.vue";
import PreviewPdf from "@/components/craft/pdf/preview/PreviewPdf.vue";
import ButtonPanel from "@/components/craft/pdf/ButtonPanel.vue";
import ResultGenerator from "@/components/craft/pdf/print/ResultGenerator.vue";
import ScriptOptionsPopup from "@/components/craft/pdf/ScriptOptionsPopup.vue";
import {computed, ref, watch, watchEffect} from "vue";
import Spinner from "@/components/ui/Spinner.vue";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {useIndexStore} from "@/store";
import {isEqualWithDefault} from "@/constants/other";
import {cloneDeep} from "lodash/lang";

defineOptions({
  name: 'edit-script'
})

const craftStore = useCraftStore()
const indexStore = useIndexStore()
const { isOpenPdfOptions, isWaitingOperation, pdfListWithParams, isEditingScript, activeScriptIndex } = storeToRefs(craftStore)
const elems = ref({})

const isBootleggersEnabled = computed(() => {
  return pdfListWithParams.value['fabled'].find(el => el.id === 'bootlegger') !== undefined
})

watch(pdfListWithParams, (val) => {
  if(Object.values(elems.value).flat().length === 0 && Object.values(val).flat().length > 0 && activeScriptIndex.value >= 0){
    elems.value = cloneDeep(val)
  }

  isEditingScript.value = !isEqualWithDefault(pdfListWithParams.value, elems.value)
}, {immediate: true})

watch(isEditingScript, (value, oldValue) => {
  if(oldValue && !value){
    elems.value = cloneDeep(pdfListWithParams.value)
  }
})

watchEffect(() => {
  isEditingScript.value ? indexStore.focusWindow('full-character-list-craft') : indexStore.unfocusWindow()
})
</script>