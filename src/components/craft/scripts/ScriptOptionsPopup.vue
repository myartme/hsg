<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="$emit('isOpenOptions')">
    <template #header>
      <div class="flex items-center gap-2 pl-0 pb-1">
        <h2 class="text-xl font-bold title-theme">Script options</h2>
        <action-button v-if="isCanSave"
                       icon="save"
                       icon-size="w-6 h-6"
                       button-class="w-10 h-10"
                       :is-show-effect="true"
                       :handle="handleSaveScript" />
        <action-button icon="undo"
                       icon-size="w-7 h-7"
                       button-class="w-10 h-10"
                       tooltip="Reset version information"
                       :is-show-effect="true"
                       :handle="handleResetVersions" />
        <action-button icon="delete"
                       icon-size="w-7 h-7"
                       button-class="w-10 h-10"
                       tooltip="Delete all versions of this script"
                       :is-show-effect="true"
                       @click="isVisibleDeleteDialog = true" />
      </div>
    </template>
    <template #content>
      <simple-input
          v-model:value="meta.name"
          label="Name"
          :maxlength="50"
          :disabled="true"
          class="mb-2" />
      <simple-input
          v-model:value="meta.author"
          label="Author"
          :maxlength="50"
          required="This field is required."
          class="mb-2" />
      <simple-input
          v-model:value="meta.almanac"
          label="Almanac"
          :maxlength="250"
          class="mb-2" />
      <simple-checkbox
          v-model:value="meta.hideTitle"
          label="Hide Title"
          tooltip="You can hide script's title." />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <simple-input
            v-model:value="meta.logo"
            label="Logo"
            :maxlength="250"
            class="mb-2" />
        <simple-input
            v-model:value="meta.background"
            label="Background"
            :maxlength="250"
            class="mb-2" />
        <img v-if="meta.logo" :src="meta.logo" class="mt-10 h-50 object-cover rounded mx-auto" alt="logo">
        <img v-if="meta.background" :src="meta.background" class="mt-10 h-50 object-cover rounded mx-auto" alt="background">
      </div>
      <confirm-dialog v-if="isVisibleDeleteDialog"
                      :title="`Deleting all versions of ${meta.name}`"
                      :description="`This action cannot be undone. Are you sure you want to delete all versions of this script?`"
                      @confirm="handleDeleteScript()"
                      @cancel="isVisibleDeleteDialog = false" />
    </template>
  </popup-container>
</template>
<script setup>
import SimpleInput from "@/components/ui/SimpleInput.vue";
import {ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import {DEFAULT_VERSION, SET_INDEX, ZERO_VERSION} from "@/constants/other";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import router from "@/router";
import {isEqual} from "lodash/lang";
import PopupContainer from "@/components/PopupContainer.vue";

const props = defineProps({
  isOpen: Boolean
})

const craftStore = useCraftStore()
const { pdfMeta, activeScriptIndex, activeVersion } = storeToRefs(craftStore)
const meta = ref({})
const defaultMeta = ref({})
const isVisibleDeleteDialog = ref(false)
const isCanSave = ref(false)
const emits = defineEmits(['isOpenOptions'])

function handleSaveScript(){
  try {
    craftStore.saveUpdateMeta(meta.value)
    return true
  } catch {
    return false
  }
}

function handleResetVersions() {
  try {
    craftStore.saveUpdateVersions(meta.value)
    router.push({ name: 'scriptList' })
    emits('isOpenOptions')
    activeVersion.value = ZERO_VERSION
    return true
  } catch {
    return false
  }
}

function handleDeleteScript(){
  craftStore.deleteScripts(meta.value?.name)
  router.push({ name: 'scriptList' })
  emits('isOpenOptions')
  activeScriptIndex.value = SET_INDEX.DEFAULT
  activeVersion.value = DEFAULT_VERSION
}

watch(meta, () => {
  isCanSave.value = !isEqual(meta.value, defaultMeta.value)
}, {deep:true})

watch(pdfMeta, (newVal) => {
  meta.value = {...newVal}
  defaultMeta.value = {...newVal}
},{ immediate: true})
</script>