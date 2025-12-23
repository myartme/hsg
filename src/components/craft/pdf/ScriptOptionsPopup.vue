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
      <simple-input
          v-model:value="meta.author"
          class="mb-2"
          :label="$t('scriptEditor.author')"
          :maxlength="50"
          @focusin="authorFocusIn"
          @focusout="authorFocusOut"
          :info="$t('scriptEditor.versionLocalValueInfo')"
          info-icon="warning"
          info-color="fill-[color:var(--color-warning)]"
          :tooltip="meta.different?.author?.isEqual === false ? $t('scriptEditor.differentFromGlobal', { value: meta.different.author.generalValue }) : ''"
          tooltip-icon="different"
          tooltip-color="fill-[color:var(--color-error)]" />
      <simple-input
          v-model:value="meta.almanac"
          class="mb-2"
          :label="$t('scriptEditor.almanac')"
          :maxlength="250"
          placeholder="https://"
          :info="$t('scriptEditor.versionLocalValueInfo')"
          info-icon="warning"
          info-color="fill-[color:var(--color-warning)]"
          :tooltip="meta.different?.almanac?.isEqual === false ? $t('scriptEditor.differentFromGlobal', { value: meta.different.almanac.generalValue || $t('scriptEditor.emptyValue') }) : ''"
          tooltip-icon="different"
          tooltip-color="fill-[color:var(--color-error)]" />
      <simple-checkbox
          v-model:value="meta.hideTitle"
          class="mb-2"
          :label="$t('scriptEditor.hideScriptName')"
          :info="$t('scriptEditor.versionLocalValueInfo')"
          info-icon="warning"
          info-color="fill-[color:var(--color-warning)]"
          :tooltip="meta.different?.hideTitle?.isEqual === false ? $t('scriptEditor.differentFromGlobalBool', { value: meta.different.hideTitle.generalValue }) : ''"
          tooltip-icon="different"
          tooltip-color="fill-[color:var(--color-error)]" />
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
        <simple-input
            v-model:value="meta.logo"
            :label="$t('scriptEditor.logo')"
            :maxlength="250"
            placeholder="https://"
            :info="$t('scriptEditor.versionLocalValueInfo')"
            info-icon="warning"
            info-color="fill-[color:var(--color-warning)]"
            :tooltip="meta.different?.logo?.isEqual === false ? $t('scriptEditor.differentFromGlobal', { value: meta.different.logo.generalValue || $t('scriptEditor.emptyValue') }) : ''"
            tooltip-icon="different"
            tooltip-color="fill-[color:var(--color-error)]" />
        <simple-input
            v-model:value="meta.background"
            :label="$t('scriptEditor.background')"
            :maxlength="250"
            placeholder="https://"
            :info="$t('scriptEditor.versionLocalValueInfo')"
            info-icon="warning"
            info-color="fill-[color:var(--color-warning)]"
            :tooltip="meta.different?.background?.isEqual === false ? $t('scriptEditor.differentFromGlobal', { value: meta.different.background.generalValue || $t('scriptEditor.emptyValue') }) : ''"
            tooltip-icon="different"
            tooltip-color="fill-[color:var(--color-error)]" />
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
import {computed, ref, watch, toRaw} from "vue";
import {isEqual, cloneDeep} from "lodash/lang";
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
import InputColorTag from "@/components/craft/scripts/InputColorTag.vue";
import {pushState, ACTION_TYPES} from "@/store/craft/history";

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
const meta = ref({})
const initialMeta = ref(null)
const initialTags = ref([])
const isVisibleDeleteDialog = ref(false)
const emits = defineEmits(['update:isOpen'])

function closeWindow(){
  const currentTags = Object.values(scriptTags.value).map(({title}) => title)

  // Проверяем реальные изменения в мета-данных
  if (initialMeta.value) {
    const fieldsToCompare = ['name', 'author', 'almanac', 'hideTitle', 'note', 'logo', 'background']
    const hasMetaChanges = fieldsToCompare.some(field => meta.value[field] !== initialMeta.value[field])
    const hasTagChanges = !isEqual([...currentTags].sort(), [...initialTags.value].sort())

    if (hasMetaChanges || hasTagChanges) {
      // Determine action type and value
      let actionType = ACTION_TYPES.UNKNOWN
      let actionValue = meta.value.name

      if (meta.value.name !== initialMeta.value.name) {
        actionType = ACTION_TYPES.CHANGE_NAME
        actionValue = meta.value.name
      } else if (meta.value.author !== initialMeta.value.author) {
        actionType = ACTION_TYPES.CHANGE_AUTHOR
        actionValue = meta.value.author
      } else if (meta.value.almanac !== initialMeta.value.almanac) {
        actionType = ACTION_TYPES.CHANGE_ALMANAC
        actionValue = meta.value.almanac
      } else if (meta.value.logo !== initialMeta.value.logo) {
        actionType = ACTION_TYPES.CHANGE_LOGO
        actionValue = meta.value.name
      }

      // Save state for undo BEFORE applying changes
      pushState(actionType, actionValue)
      isEditingScript.value = true

      // Apply changes from meta copy back to pdfMeta
      fieldsToCompare.forEach(field => {
        pdfMeta.value[field] = meta.value[field]
      })
    }
  }

  pdfMeta.value['tags'] = currentTags
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

// Initialize meta when popup opens (not on every pdfMeta change)
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Create a deep copy of pdfMeta for editing (using toRaw to avoid reactive proxy issues)
    const rawPdfMeta = toRaw(pdfMeta.value)
    meta.value = cloneDeep(rawPdfMeta)

    // Save initial state for comparison (plain values, not reactive)
    initialMeta.value = {
      name: rawPdfMeta.name,
      author: rawPdfMeta.author,
      almanac: rawPdfMeta.almanac,
      hideTitle: rawPdfMeta.hideTitle,
      note: rawPdfMeta.note,
      logo: rawPdfMeta.logo,
      background: rawPdfMeta.background
    }
    initialTags.value = [...(rawPdfMeta.tags || [])]

    // Initialize tags
    if(!isEmpty(meta.value.tags)){
      scriptTags.value = (meta.value.tags || [])
          .map(tag => tags.value.find(el => el.title === tag))
          .filter(Boolean)
    } else {
      scriptTags.value = []
    }
  }
}, { immediate: true })

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
