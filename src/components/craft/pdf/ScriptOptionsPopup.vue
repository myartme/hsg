<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="closeWindow">
    <template #header>
      <div class="flex items-center gap-2 pl-0 pb-1">
        <h2 class="text-xl font-bold title-theme">Script options</h2>
        <action-button v-if="isSavedScript"
                       icon="delete"
                       icon-size="w-7 h-7"
                       button-class="w-10 h-10"
                       tooltip="Delete all versions of this script"
                       @click="isVisibleDeleteDialog = true" />
      </div>
    </template>
    <template #content>
      <simple-input
          v-model:value="meta.name"
          label="Script name"
          @focusin="nameUpdate"
          @focusout="nameUpdate"
          :maxlength="50"
          required="This field is required."
          info="Changing this value will be considered a new script!"
          :tooltip='meta.name === DEFAULT_SCRIPT_NAME ? `This value must be different from the default value <strong>${DEFAULT_SCRIPT_NAME}</strong>. ` : ""'
          tooltip-icon="alert"
          tooltip-color="fill-[color:var(--color-error)]"
          class="mb-2" />
      <div class="flex items-end mb-2">
        <simple-input
            v-model:value="meta.author"
            class="w-full"
            label="Author"
            :maxlength="50"
            info="This value is common to all versions of the script."
            :different="getDifferentText(meta.different?.author?.isEqual)" />
        <action-button-in-script-option-popup
            :value="meta.different?.author"
            @value-update="meta.author = $event" />
      </div>
      <div class="flex items-end mb-2">
        <simple-input
            v-model:value="meta.almanac"
            class="w-full"
            label="Almanac"
            :maxlength="250"
            info="This value is common to all versions of the script."
            :different="getDifferentText(meta.different?.almanac?.isEqual)" />
        <action-button-in-script-option-popup
            :value="meta.different?.almanac"
            @value-update="meta.almanac = $event" />
      </div>
      <div class="flex items-end mb-2">
        <simple-checkbox
            v-model:value="meta.hideTitle"
            label="Hide script name"
            info="You can hide script's title in the script.<br>This value is common to all versions of the script."
            :different="getDifferentText(meta.different?.hideTitle?.isEqual)"/>
        <action-button-in-script-option-popup
            :value="meta.different?.hideTitle"
            @value-update="meta.hideTitle = $event" />
      </div>
      <template v-if="isBootleggersEnabled">
        <simple-input-tag
            v-model:value="rules"
            div-class="mt-2"
            label="Bootlegger rules"
            :max-tags="10"
            :maxlength="250"
            info="Bootlegger rules for this script." />
        <simple-dropdown
            v-if="!isEmpty(bootleggerOptions)"
            label="Character's bootlegger list"
            info="Bootlegger rules for all characters contained in the current script. Click to add."
            div-class="mt-2"
            v-model:value="rule"
            :list="bootleggerOptions"
            default-value="Add Bootlegger..." />
      </template>
      <input-color-tag v-if="scriptTags.length > 0"
                       v-model:value="scriptTags"
                       div-class="mt-2"
                       label="Tags"
                       :max-tags="10"
                       :maxlength="250"
                       info="Tags for filtering scripts." />
      <simple-dropdown v-if="tags.length > 0"
                       label="Tags list"
                       info="All script tags. Click to add."
                       div-class="mt-2 mb-2"
                       v-model:value="selectedTag"
                       :list="Object.values(tags).map(({ title }) => title)"
                       default-value="Add tag..." />
      <simple-textarea
          v-model:value="meta.note"
          label="Note"
          :maxlength="5000"
          rows="6"
          class="mt-2"
          info="Your custom note." />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-end mb-2">
          <simple-input
              v-model:value="meta.logo"
              label="Logo"
              class="w-full"
              :maxlength="250"
              info="Enter image URL. This value is common to all versions of the script."
              input-class="rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm form-input pr-23"
              :different="getDifferentText(meta.different?.logo?.isEqual)" />
          <action-button-in-script-option-popup
              :value="meta.different?.logo"
              @value-update="meta.logo = $event" />
        </div>
        <div class="flex items-end mb-2">
          <simple-input
              v-model:value="meta.background"
              class="w-full"
              label="Background"
              :maxlength="250"
              info="Enter image URL. This value is common to all versions of the script."
              input-class="rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm form-input pr-23"
              :different="getDifferentText(meta.different?.background?.isEqual)" />
          <action-button-in-script-option-popup
              :value="meta.different?.background"
              @value-update="meta.background = $event" />
        </div>
        <div class="mt-2 max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.logo" :src="meta.logo" class="max-h-[500px] object-contain w-full rounded"  alt="logo">
        </div>
        <div class="mt-2 max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.background" :src="meta.background" class="max-h-[500px] object-contain w-full rounded" alt="background">
        </div>
      </div>
      <confirm-dialog v-if="isVisibleDeleteDialog"
                      :title="`Deleting ${meta.name} and all versions`"
                      :description="`This action cannot be undone. Are you sure you want to delete this script with versions ${deletingVersions}?`"
                      @confirm="handleDeleteScript()"
                      @cancel="isVisibleDeleteDialog = false" />
    </template>
  </popup-container>
</template>
<script setup>
import SimpleInput from "@/components/ui/SimpleInput.vue";
import {computed, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import SimpleInputTag from "@/components/ui/SimpleInputTag.vue";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import {isEmpty} from "lodash/lang";
import ActionButton from "@/components/ui/ActionButton.vue";
import {DEFAULT_VERSION, SET_INDEX} from "@/constants/other";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import router from "@/router";
import PopupContainer from "@/components/PopupContainer.vue";
import {useLibraryStore} from "@/store/library";
import {DEFAULT_SCRIPT_NAME} from "@/constants/roles";
import ActionButtonInScriptOptionPopup from "@/components/craft/pdf/ActionButtonInScriptOptionPopup.vue";
import InputColorTag from "@/components/craft/scripts/InputColorTag.vue";

const props = defineProps({
  isOpen: Boolean,
  isBootleggersEnabled: Boolean
})

const libraryStore = useLibraryStore()
const craftStore = useCraftStore()
const { bootlegger } = storeToRefs(libraryStore)
const { pdfMeta, pdfListWithParams, activeScriptIndex, activeVersion, isSavedScript, tags } = storeToRefs(craftStore)
const scriptTags = ref([])
const selectedTag = ref('')
const bootleggerDefault = computed(() => {
  return pdfMeta.value.bootlegger || []
})

const deletingVersions = computed(() => {
  let result = ""
  let issetVersion = false
  meta.value?.list.forEach(el => {
    if(issetVersion){
      result += ', '
    }
    if(!issetVersion){
      issetVersion = true
    }
    result += el.version
  })

  return result
})
const meta = ref({})
const rules = ref([...bootleggerDefault.value])
const isVisibleDeleteDialog = ref(false)
const rule = ref('')
const emits = defineEmits(['update:isOpen'])
const bootleggerOptions = computed(() => {
  return Object.values(pdfListWithParams.value)
      .flat()
      .flatMap(el => bootlegger.value[el.team].find(boot => boot.id === el.id)?.rules || [])
})

function getDifferentText(value) {
  return value === false ? "This value in the current version doesn\'t match the default value for the script.<br>Save the current version to update default value." : ""
}

function closeWindow(){
  pdfMeta.value['bootlegger'] = rules.value
  pdfMeta.value['tags'] = Object.values(scriptTags.value).map(({title}) => title)
  emits('update:isOpen', !props.isOpen)
}

function handleDeleteScript(){
  craftStore.deleteScripts(meta.value?.name)
  router.push({ name: 'scriptList' })
  activeScriptIndex.value = SET_INDEX.DEFAULT
  activeVersion.value = DEFAULT_VERSION
}

function nameUpdate(event){
  if(event.target?.value === DEFAULT_SCRIPT_NAME){
    meta.value.name = ""
  }
}

watch(rule, (newVal) => {
  if (newVal && !rules.value.includes(newVal) && rules.value.length < 10) {
    rules.value = [...rules.value, newVal]
    rule.value = ""
  }
})

watch(pdfMeta, (newVal) => {
  meta.value = newVal
  if(!isEmpty(meta.value.tags)){
    scriptTags.value = (meta.value.tags || [])
        .map(tag => tags.value.find(el => el.title === tag))
        .filter(Boolean)
  } else {
    scriptTags.value = []
  }
},{ immediate: true, deep: true})

watch(() => pdfMeta.value?.bootlegger, (newVal) => {
  rules.value = Array.isArray(newVal) ? [...newVal] : []
}, { immediate: true })

watch(selectedTag, (val) => {
  if(val !== '' && !meta.value.tags.includes(val)){
    const idx = tags.value.findIndex(({title}) => title === val)
    if(idx !== -1){
      scriptTags.value = [...scriptTags.value, tags.value[idx]]
      selectedTag.value = ''
    }
  }
})
</script>