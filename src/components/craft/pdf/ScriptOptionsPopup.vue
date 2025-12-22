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
                       :tooltip="$t('scripts.deleteThisVersion')"
                       @click="isVisibleDeleteDialog = true" />
      </div>
    </template>
    <template #content>
      <simple-input
          v-model:value="meta.name"
          :label="$t('scriptEditor.scriptName')"
          @focusin="nameFocusIn"
          @focusout="nameFocusOut"
          :maxlength="50"
          :required="$t('validation.fieldRequired')"
          :info="$t('scriptEditor.scriptNameInfo')"
          info-icon="warning"
          info-color="fill-[color:var(--color-warning)]"
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
            @focusin="authorFocusIn"
            @focusout="authorFocusOut"
            :tooltip="$t('scriptEditor.commonValueInfo')"
            tooltip-icon="warning"
            tooltip-color="fill-[color:var(--color-warning)]"
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
            placeholder="https://"
            :info="$t('scriptEditor.almanacInfo')"
            :tooltip="$t('scriptEditor.commonValueInfo')"
            tooltip-icon="warning"
            tooltip-color="fill-[color:var(--color-warning)]"
            :different="getDifferentText(meta.different?.almanac?.isEqual)" />
        <action-button-in-script-option-popup
            :value="meta.different?.almanac"
            @value-update="meta.almanac = $event" />
      </div>
      <div class="flex items-end mb-2">
        <simple-checkbox
            v-model:value="meta.hideTitle"
            :label="$t('scriptEditor.hideScriptName')"
            :tooltip="$t('scriptEditor.commonValueInfo')"
            tooltip-icon="warning"
            tooltip-color="fill-[color:var(--color-warning)]"
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
              placeholder="https://"
              :tooltip="$t('scriptEditor.commonValueInfo')"
              tooltip-icon="warning"
              tooltip-color="fill-[color:var(--color-warning)]"
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
              placeholder="https://"
              :tooltip="$t('scriptEditor.commonValueInfo')"
              tooltip-icon="warning"
              tooltip-color="fill-[color:var(--color-warning)]"
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
                      :title="$t('scripts.deletingVersion', { name: meta.name, version: pdfMeta.version })"
                      :description="$t('scripts.deleteConfirm')"
                      @confirm="handleDeleteScript()"
                      @cancel="isVisibleDeleteDialog = false" />
    </template>
  </popup-container>
</template>
<script setup>
import SimpleInput from "@/components/ui/SimpleInput.vue";
import {computed, ref, watch} from "vue";
import {isEqual} from "lodash/lang";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import {isEmpty} from "lodash";
import ActionButton from "@/components/ui/ActionButton.vue";
import BootleggerFields from "@/components/craft/pdf/BootleggerFields.vue";
import {DEFAULT_VERSION, SET_INDEX} from "@/constants/other";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import router from "@/router";
import PopupContainer from "@/components/PopupContainer.vue";
import {DEFAULT_SCRIPT_NAME, DEFAULT_SCRIPT_AUTHOR} from "@/constants/roles";
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
const previousName = ref('')
const previousAuthor = ref('')

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
const initialMeta = ref(null)
const initialTags = ref([])
const isVisibleDeleteDialog = ref(false)
const emits = defineEmits(['update:isOpen'])

function getDifferentText(value) {
  return value === false ? t('scriptEditor.differentValueInfo') : ""
}

function closeWindow(){
  const currentTags = Object.values(scriptTags.value).map(({title}) => title)
  pdfMeta.value['tags'] = currentTags

  // Проверяем реальные изменения в мета-данных
  if (initialMeta.value) {
    const fieldsToCompare = ['name', 'author', 'almanac', 'hideTitle', 'note', 'logo', 'background']
    const hasMetaChanges = fieldsToCompare.some(field => meta.value[field] !== initialMeta.value[field])
    const hasTagChanges = !isEqual([...currentTags].sort(), [...initialTags.value].sort())

    if (hasMetaChanges || hasTagChanges) {
      isEditingScript.value = true
    }
  }

  emits('update:isOpen', !props.isOpen)
}

async function handleDeleteScript(){
  isVisibleDeleteDialog.value = false
  await craftStore.deleteScript(pdfMeta.value.version, meta.value?.name)
  isEditingScript.value = false
  router.push({ name: 'scriptList' })
  activeScriptIndex.value = SET_INDEX.DEFAULT
  activeVersion.value = DEFAULT_VERSION
}

function nameFocusIn(event){
  previousName.value = meta.value.name
  event.target?.select()
}

function nameFocusOut(event){
  const trimmed = event.target?.value?.trim()
  if(!trimmed){
    meta.value.name = previousName.value
  }
}

function authorFocusIn(event){
  previousAuthor.value = meta.value.author
  event.target?.select()
}

function authorFocusOut(event){
  const trimmed = event.target?.value?.trim()
  if(!trimmed){
    meta.value.author = previousAuthor.value
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

// Сохраняем начальное состояние при открытии попапа
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    initialMeta.value = {
      name: pdfMeta.value.name,
      author: pdfMeta.value.author,
      almanac: pdfMeta.value.almanac,
      hideTitle: pdfMeta.value.hideTitle,
      note: pdfMeta.value.note,
      logo: pdfMeta.value.logo,
      background: pdfMeta.value.background
    }
    initialTags.value = [...(pdfMeta.value.tags || [])]
  }
})

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
