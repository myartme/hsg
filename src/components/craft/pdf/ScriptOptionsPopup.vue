<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="closeWindow">
    <template #header>
      <div class="flex items-center gap-2 pl-0 pb-1">
        <h2 class="text-xl font-bold title-theme">{{ $t('scriptEditor.scriptOptions') }}</h2>
        <action-button v-if="isSavedScript"
                       icon="delete"
                       icon-size="w-7 h-7"
                       button-class="w-10 h-10"
                       :tooltip="$t('tooltips.deleteAllVersions')"
                       @click="isVisibleDeleteDialog = true" />
      </div>
    </template>
    <template #content>
      <simple-input
          v-model:value="meta.name"
          :label="$t('scriptEditor.scriptName')"
          @focusin="nameUpdate"
          @focusout="nameUpdate"
          :maxlength="50"
          :required="$t('validation.fieldRequired')"
          :info="$t('scriptEditor.scriptNameInfo')"
          :tooltip='meta.name === DEFAULT_SCRIPT_NAME ? $t("scriptEditor.scriptNameDefaultWarning", { name: DEFAULT_SCRIPT_NAME }) : ""'
          tooltip-icon="alert"
          tooltip-color="fill-[color:var(--color-error)]"
          class="mb-2" />
      <div class="flex items-end mb-2">
        <simple-input
            v-model:value="meta.author"
            class="w-full"
            :label="$t('scriptEditor.author')"
            :maxlength="50"
            :info="$t('scriptEditor.commonValueInfo')"
            :different="getDifferentText(meta.different?.author?.isEqual)" />
        <action-button-in-script-option-popup
            :value="meta.different?.author"
            @value-update="meta.author = $event" />
      </div>
      <div class="flex items-end mb-2">
        <simple-input
            v-model:value="meta.almanac"
            class="w-full"
            :label="$t('scriptEditor.almanac')"
            :maxlength="250"
            :info="$t('scriptEditor.commonValueInfo')"
            :different="getDifferentText(meta.different?.almanac?.isEqual)" />
        <action-button-in-script-option-popup
            :value="meta.different?.almanac"
            @value-update="meta.almanac = $event" />
      </div>
      <div class="flex items-end mb-2">
        <simple-checkbox
            v-model:value="meta.hideTitle"
            :label="$t('scriptEditor.hideScriptName')"
            :info="$t('scriptEditor.hideScriptNameInfo')"
            :different="getDifferentText(meta.different?.hideTitle?.isEqual)"/>
        <action-button-in-script-option-popup
            :value="meta.different?.hideTitle"
            @value-update="meta.hideTitle = $event" />
      </div>
      <bootlegger-fields v-if="isBootleggersEnabled" />
      <input-color-tag v-if="scriptTags.length > 0"
                       v-model:value="scriptTags"
                       div-class="mt-2"
                       :label="$t('scriptEditor.tags')"
                       :max-tags="10"
                       :maxlength="250"
                       :info="$t('scriptEditor.tagsInfo')" />
      <simple-dropdown v-if="tags.length > 0"
                       :label="$t('scriptEditor.tagsList')"
                       :info="$t('scriptEditor.tagsListInfo')"
                       div-class="mt-2 mb-2"
                       v-model:value="selectedTag"
                       :list="Object.values(tags).map(({ title }) => title)"
                       :default-value="$t('scriptEditor.addTag')" />
      <simple-textarea
          v-model:value="meta.note"
          :label="$t('scriptEditor.note')"
          :maxlength="5000"
          rows="6"
          class="mt-2"
          :info="$t('scriptEditor.noteInfo')" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-end">
          <simple-input
              v-model:value="meta.logo"
              :label="$t('scriptEditor.logo')"
              class="w-full"
              :maxlength="250"
              :info="$t('scriptEditor.imageUrlInfo')"
              input-class="rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm form-input pr-23"
              :different="getDifferentText(meta.different?.logo?.isEqual)" />
          <action-button-in-script-option-popup
              :value="meta.different?.logo"
              @value-update="meta.logo = $event" />
        </div>
        <div class="flex items-end">
          <simple-input
              v-model:value="meta.background"
              class="w-full"
              :label="$t('scriptEditor.background')"
              :maxlength="250"
              :info="$t('scriptEditor.imageUrlInfo')"
              input-class="rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm form-input pr-23"
              :different="getDifferentText(meta.different?.background?.isEqual)" />
          <action-button-in-script-option-popup
              :value="meta.different?.background"
              @value-update="meta.background = $event" />
        </div>
        <div class="max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.logo" :src="meta.logo" class="max-h-[500px] object-contain w-full rounded"  alt="logo">
        </div>
        <div class="max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.background" :src="meta.background" class="max-h-[500px] object-contain w-full rounded" alt="background">
        </div>
      </div>
      <confirm-dialog v-if="isVisibleDeleteDialog"
                      :title="$t('scriptEditor.deletingScript', { name: meta.name })"
                      :description="$t('scriptEditor.deleteScriptConfirm', { versions: deletingVersions })"
                      @confirm="handleDeleteScript()"
                      @cancel="isVisibleDeleteDialog = false" />
    </template>
  </popup-container>
</template>
<script setup>
import SimpleInput from "@/components/ui/SimpleInput.vue";
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import {isEmpty} from "lodash/lang";
import ActionButton from "@/components/ui/ActionButton.vue";
import BootleggerFields from "@/components/craft/pdf/BootleggerFields.vue";
import {DEFAULT_VERSION, SET_INDEX} from "@/constants/other";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import router from "@/router";
import PopupContainer from "@/components/PopupContainer.vue";
import {DEFAULT_SCRIPT_NAME} from "@/constants/roles";
import ActionButtonInScriptOptionPopup from "@/components/craft/pdf/ActionButtonInScriptOptionPopup.vue";
import InputColorTag from "@/components/craft/scripts/InputColorTag.vue";

const { t } = useI18n()

const props = defineProps({
  isOpen: Boolean,
  isBootleggersEnabled: Boolean
})

const craftStore = useCraftStore()
const { pdfMeta, activeScriptIndex, activeVersion, isSavedScript, tags, isEditingScript } = storeToRefs(craftStore)
const scriptTags = ref([])
const selectedTag = ref('')

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
const isVisibleDeleteDialog = ref(false)
const emits = defineEmits(['update:isOpen'])

function getDifferentText(value) {
  return value === false ? t('scriptEditor.differentValueInfo') : ""
}

function closeWindow(){
  if(!isEditingScript.value){
    isEditingScript.value = true
  }
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

watch(selectedTag, (val) => {
  if(val !== '' && !scriptTags.value.find(({title}) => title === val)){
    const idx = tags.value.findIndex(({title}) => title === val)
    if(idx !== -1){
      scriptTags.value = [...scriptTags.value, tags.value[idx]]
    }
  }
  selectedTag.value = ''
})
</script>
