<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="handleClose">
    <template #header>
      <div class="flex items-center gap-2 pl-0 pb-1">
        <h2 class="text-xl font-bold title-theme">{{ $t('scriptEditor.scriptOptions') }}</h2>
        <action-button v-if="isCanSave"
                       icon="save"
                       icon-size="w-6 h-6"
                       button-class="w-10 h-10"
                       :is-show-effect="true"
                       :handle="handleSaveScript" />
        <action-button icon="revert"
                       icon-size="w-7 h-7"
                       button-class="w-10 h-10"
                       :tooltip="$t('tooltips.resetVersionInfo')"
                       :is-show-effect="true"
                       :handle="handleResetVersions" />
        <action-button icon="delete"
                       icon-size="w-7 h-7"
                       button-class="w-10 h-10"
                       :tooltip="$t('tooltips.deleteAllVersions')"
                       :is-show-effect="true"
                       @click="isVisibleDeleteDialog = true" />
      </div>
    </template>
    <template #content>
      <simple-input
          v-model:value="meta.name"
          :label="$t('scriptEditor.scriptName')"
          :maxlength="50"
          :disabled="true"
          class="mb-2" />

      <div class="relative mb-2">
        <simple-input
            v-model:value="meta.author"
            :label="$t('scriptEditor.author')"
            :maxlength="50"
            @focusin="authorFocusIn"
            @focusout="authorFocusOut"
            :tooltip="getFieldDifferences('author').length > 0 ? $t('scriptEditor.versionsHaveDifferences') : ''"
            tooltip-icon="different"
            tooltip-color="fill-[color:var(--color-error)]"
            :tooltip-clickable="getFieldDifferences('author').length > 0"
            @tooltip-click="openValuePicker('author', $event)" />
        <value-picker-popup
            v-if="activePickerField === 'author'"
            :global-value="meta.author"
            :field-label="$t('scriptEditor.author')"
            :version-differences="getFieldDifferences('author')"
            @select="handleValueSelect('author', $event)"
            @close="closeValuePicker" />
      </div>

      <div class="relative mb-2">
        <simple-input
            v-model:value="meta.almanac"
            :label="$t('scriptEditor.almanac')"
            :maxlength="250"
            placeholder="https://"
            :tooltip="getFieldDifferences('almanac').length > 0 ? $t('scriptEditor.versionsHaveDifferences') : ''"
            tooltip-icon="different"
            tooltip-color="fill-[color:var(--color-error)]"
            :tooltip-clickable="getFieldDifferences('almanac').length > 0"
            @tooltip-click="openValuePicker('almanac', $event)" />
        <value-picker-popup
            v-if="activePickerField === 'almanac'"
            :global-value="meta.almanac"
            :field-label="$t('scriptEditor.almanac')"
            :version-differences="getFieldDifferences('almanac')"
            @select="handleValueSelect('almanac', $event)"
            @close="closeValuePicker" />
      </div>

      <simple-checkbox
          v-model:value="meta.hideTitle"
          :label="$t('scriptEditor.hideScriptName')"
          :tooltip="getFieldDifferences('hideTitle').length > 0 ? $t('scriptEditor.versionsHaveDifferencesBool') : $t('tooltips.hideScriptTitle')"
          :tooltip-icon="getFieldDifferences('hideTitle').length > 0 ? 'different' : ''"
          :tooltip-color="getFieldDifferences('hideTitle').length > 0 ? 'fill-[color:var(--color-error)]' : ''" />

      <input-color-tag v-if="scriptTags.length > 0"
          v-model:value="scriptTags"
          div-class="mt-2"
          :label="$t('scriptEditor.tags')"
          :max-tags="10"
          :maxlength="250"
          :info="$t('scriptEditor.tagsInfo')" />
      <simple-dropdown
          v-if="tags.length > 0"
          :label="$t('scriptEditor.tagsList')"
          :info="$t('scriptEditor.tagsListInfo')"
          div-class="mt-2 mb-2"
          v-model:value="selectedTag"
          :list="Object.values(tags).map(({ title }) => title)"
          :default-value="$t('scriptEditor.addTag')" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div class="flex items-end relative">
          <simple-input
              v-model:value="meta.logo"
              :label="$t('scriptEditor.logo')"
              :maxlength="250"
              placeholder="https://"
              div-class="w-full"
              :tooltip="getFieldDifferences('logo').length > 0 ? $t('scriptEditor.versionsHaveDifferences') : ''"
              tooltip-icon="different"
              tooltip-color="fill-[color:var(--color-error)]"
              :tooltip-clickable="getFieldDifferences('logo').length > 0"
              @tooltip-click="openValuePicker('logo', $event)" />
          <value-picker-popup
              v-if="activePickerField === 'logo'"
              :global-value="meta.logo"
              :field-label="$t('scriptEditor.logo')"
              :version-differences="getFieldDifferences('logo')"
              @select="handleValueSelect('logo', $event)"
              @close="closeValuePicker" />
        </div>
        <div class="flex items-end relative">
          <simple-input
              v-model:value="meta.background"
              :label="$t('scriptEditor.background')"
              :maxlength="250"
              placeholder="https://"
              div-class="w-full"
              :tooltip="getFieldDifferences('background').length > 0 ? $t('scriptEditor.versionsHaveDifferences') : ''"
              tooltip-icon="different"
              tooltip-color="fill-[color:var(--color-error)]"
              :tooltip-clickable="getFieldDifferences('background').length > 0"
              @tooltip-click="openValuePicker('background', $event)" />
          <value-picker-popup
              v-if="activePickerField === 'background'"
              :global-value="meta.background"
              :field-label="$t('scriptEditor.background')"
              :version-differences="getFieldDifferences('background')"
              @select="handleValueSelect('background', $event)"
              @close="closeValuePicker" />
        </div>
        <div class="max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.logo" :src="meta.logo" class="max-h-[500px] object-contain w-full rounded"  alt="logo">
        </div>
        <div class="max-h-[500px] mx-auto rounded object-cover">
          <img v-if="meta.background" :src="meta.background" class="max-h-[500px] object-contain w-full rounded" alt="background">
        </div>
      </div>
      <confirm-dialog v-if="isVisibleDeleteDialog"
                      :title="$t('scriptEditor.deletingAllVersions', { name: meta.name })"
                      :description="$t('scriptEditor.deleteAllVersionsConfirm')"
                      @confirm="handleDeleteScript()"
                      @cancel="isVisibleDeleteDialog = false" />
      <confirm-dialog v-if="isShowLeaveConfirm"
                      :title="$t('scriptEditor.unsavedChangesTitle')"
                      :description="$t('scriptEditor.unsavedChangesDesc')"
                      @confirm="confirmClose"
                      @cancel="isShowLeaveConfirm = false" />
    </template>
  </popup-container>
</template>
<script setup>
import SimpleInput from "@/components/ui/SimpleInput.vue";
import {ref, watch} from "vue";
import {useI18n} from "vue-i18n";
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
import ValuePickerPopup from "@/components/craft/scripts/ValuePickerPopup.vue";

const { t } = useI18n()

const props = defineProps({
  isOpen: Boolean
})

const craftStore = useCraftStore()
const { pdfMeta, activeScriptIndex, activeVersion, tags } = storeToRefs(craftStore)
const meta = ref({})
const defaultMeta = ref({})
const isVisibleDeleteDialog = ref(false)
const isShowLeaveConfirm = ref(false)
const isCanSave = ref(false)
const scriptTags = ref([])
const selectedTag = ref('')
const previousAuthor = ref('')
const emits = defineEmits(['isOpenOptions'])

// Метаданные всех версий
const versionsMeta = ref([])
const activePickerField = ref(null)
// Поля, которые нужно синхронизировать во всех версиях
const fieldsToSync = ref(new Set())

// Загрузка метаданных всех версий
async function loadVersionsMeta() {
  if (meta.value.name) {
    versionsMeta.value = await craftStore.loadAllVersionsMeta(meta.value.name)
  }
}

// Получить различия для поля
function getFieldDifferences(field) {
  const globalValue = meta.value[field] || ''
  const differences = []

  versionsMeta.value.forEach(vm => {
    const versionValue = vm[field] || ''
    if (field === 'hideTitle') {
      if (Boolean(versionValue) !== Boolean(globalValue)) {
        differences.push({
          version: vm.version,
          value: versionValue ? t('common.yes') : t('common.no')
        })
      }
    } else {
      if (versionValue !== globalValue) {
        differences.push({
          version: vm.version,
          value: versionValue
        })
      }
    }
  })

  return differences
}

function openValuePicker(field, event) {
  if (getFieldDifferences(field).length > 0) {
    activePickerField.value = field
  }
}

function closeValuePicker() {
  activePickerField.value = null
}

function handleValueSelect(field, item) {
  // Вставляем выбранное значение
  if (field === 'hideTitle') {
    // Для boolean поля
    meta.value[field] = item.isGlobal ? meta.value[field] : (item.value === t('common.yes'))
  } else {
    meta.value[field] = item.value
  }

  // Помечаем поле для синхронизации
  fieldsToSync.value.add(field)

  closeValuePicker()
}

async function handleSaveScript(){
  try {
    // Если есть поля для синхронизации - обновляем все версии
    if (fieldsToSync.value.size > 0) {
      await craftStore.saveGlobalMetaToAllVersions(
          meta.value.name,
          meta.value,
          Array.from(fieldsToSync.value)
      )
      fieldsToSync.value.clear()
      // Перезагружаем метаданные версий
      await loadVersionsMeta()
    }

    // Сохраняем глобальные метаданные (tags и др.)
    await craftStore.saveUpdateMeta(meta.value)

    // Обновляем defaultMeta после успешного сохранения
    defaultMeta.value = {...meta.value}

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
  isVisibleDeleteDialog.value = false
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

function handleClose(){
  if(isCanSave.value){
    isShowLeaveConfirm.value = true
  } else {
    emits('isOpenOptions')
  }
}

function confirmClose(){
  isShowLeaveConfirm.value = false
  isCanSave.value = false
  fieldsToSync.value.clear()
  meta.value = {...defaultMeta.value}
  emits('isOpenOptions')
}

// Поля, которые синхронизируются во все версии
const syncableFields = ['author', 'almanac', 'logo', 'background', 'hideTitle']

// Проверка наличия изменений
watch(meta, (newMeta) => {
  // Отслеживаем изменения в синхронизируемых полях
  syncableFields.forEach(field => {
    if (newMeta[field] !== defaultMeta.value[field]) {
      fieldsToSync.value.add(field)
    }
  })

  const hasMetaChanges = !isEqual(newMeta, defaultMeta.value)
  const hasFieldsToSync = fieldsToSync.value.size > 0
  isCanSave.value = hasMetaChanges || hasFieldsToSync
}, {deep:true})

watch(pdfMeta, async (newVal) => {
  meta.value = {...newVal}
  defaultMeta.value = {...newVal}
  fieldsToSync.value.clear()

  if(!isEmpty(meta.value.tags)){
    scriptTags.value = (meta.value.tags || [])
        .map(tag => tags.value.find(el => el.title === tag))
        .filter(Boolean)
  } else {
    scriptTags.value = []
  }

  // Загружаем метаданные всех версий
  await loadVersionsMeta()
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
