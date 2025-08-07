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
          label="Script name"
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
          label="Hide script name"
          tooltip="You can hide script's title in the script." />
      <input-color-tag v-if="scriptTags.length > 0"
          v-model:value="scriptTags"
          div-class="mt-2"
          label="Tags"
          :max-tags="10"
          :maxlength="250"
          info="Tags for filtering scripts." />
      <simple-dropdown
          v-if="tags.length > 0"
          label="Tags list"
          info="All script tags. Click to add."
          div-class="mt-2 mb-2"
          v-model:value="selectedTag"
          :list="Object.values(tags).map(({ title }) => title)"
          default-value="Add tag..." />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div class="flex items-end">
          <simple-input
              v-model:value="meta.logo"
              label="Logo"
              :maxlength="250"
              div-class="w-full" />
        </div>
        <div class="flex items-end ">
          <simple-input
              v-model:value="meta.background"
              label="Background"
              :maxlength="250"
              div-class="w-full" />
        </div>
        <div class="max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.logo" :src="meta.logo" class="max-h-[500px] object-contain w-full rounded"  alt="logo">
        </div>
        <div class="max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.background" :src="meta.background" class="max-h-[500px] object-contain w-full rounded" alt="background">
        </div>
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
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, DEFAULT_VERSION, SET_INDEX, ZERO_VERSION} from "@/constants/other";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import router from "@/router";
import {isEmpty, isEqual} from "lodash/lang";
import PopupContainer from "@/components/PopupContainer.vue";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import InputColorTag from "@/components/craft/scripts/InputColorTag.vue";

const props = defineProps({
  isOpen: Boolean
})

const craftStore = useCraftStore()
const { pdfMeta, activeScriptIndex, activeVersion, tags } = storeToRefs(craftStore)
const meta = ref({})
const defaultMeta = ref({})
const isVisibleDeleteDialog = ref(false)
const isCanSave = ref(false)
const scriptTags = ref([])
const selectedTag = ref('')
const emits = defineEmits(['isOpenOptions'])

function handleSaveScript(){
  try {
    craftStore.saveUpdateMeta(meta.value)
    setTimeout(() => {
      isCanSave.value = false
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
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
  if(!isEmpty(meta.value.tags)){
    scriptTags.value = (meta.value.tags || [])
        .map(tag => tags.value.find(el => el.title === tag))
        .filter(Boolean)
  } else {
    scriptTags.value = []
  }
},{ immediate: true})

watch(selectedTag, (val) => {
  if(val !== '' && !meta.value.tags.includes(val)){
    const idx = tags.value.findIndex(({title}) => title === val)
    if(idx !== -1){
      scriptTags.value = [...scriptTags.value, tags.value[idx]]
    }
  }
  selectedTag.value = ''
})
watch(scriptTags, (val) => {
  meta.value.tags = Object.values(val).map(({title}) => title)
})
</script>