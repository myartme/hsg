<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden relative">
    <full-character-list-craft />
    <preview-pdf />
    <result-generator class="absolute top-full pointer-events-none opacity-0" />
    <button-panel />
    <script-options-popup
        v-model:is-open="isOpenPdfOptions"
        :bootlegger="isBootleggersEnabled ? bootlegger : {}" />
    <spinner v-if="isWaitingOperation"
             item-class="fixed inset-0 z-50 bg-black/60 pointer-events-auto flex justify-center items-center" :size="15" />
  </div>
</template>

<script setup>
import FullCharacterListCraft from "@/components/craft/list/FullCharacterList.vue";
import PreviewPdf from "@/components/craft/pdf/preview/PreviewPdf.vue";
import ButtonPanel from "@/components/craft/pdf/ButtonPanel.vue";
import ResultGenerator from "@/components/craft/pdf/print/ResultGenerator.vue";
import ScriptOptionsPopup from "@/components/craft/pdf/ScriptOptionsPopup.vue";
import {computed} from "vue";
import {isOpenPdfOptions, isWaitingOperation, pdfListWithParams} from "@/store/craft/state";
import {storeToRefs} from "pinia";
import {useLibraryStore} from "@/store/library";
import Spinner from "@/components/ui/Spinner.vue";

const libraryStore = useLibraryStore()
const { bootlegger } = storeToRefs(libraryStore)
const isBootleggersEnabled = computed(() => {
  return pdfListWithParams.value['fabled'].find(el => el.id === 'bootlegger') !== -1
})
</script>