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
          <cached-image v-if="meta.logo" :src="meta.logo" img-class="max-h-[500px] object-contain w-full rounded" alt="logo" />
        </div>
        <div class="max-h-[500px] mx-auto rounded object-cover">
          <cached-image v-if="meta.background" :src="meta.background" img-class="max-h-[500px] object-contain w-full rounded" alt="background" />
        </div>
      </div>
      <!-- PDF Print Settings -->
      <div class="mt-4 pt-4 border-t border-[color:var(--color-border)]">
        <div class="flex items-center gap-2 mb-3">
          <h3 class="text-lg font-semibold title-theme">{{ $t('options.pdfPrintSettings') }}</h3>
          <info-tooltip :text="$t('options.pdfPrintSettingsInfo')" icon="info" icon-size="w-5 h-5" />
        </div>
        <div class="space-y-3">
          <!-- Role Columns + Roles/Rows Per Page -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-theme">{{ $t('options.roleColumns') }}</span>
              <pdf-option-tooltip
                  :left-label="$t('options.oneColumn')"
                  left-image="/images/elements/ui/pdf_options/one_column.png"
                  :right-label="$t('options.twoColumns')"
                  right-image="/images/elements/ui/pdf_options/two_columns.png" />
            </div>
            <div class="flex gap-2">
              <button
                  @click="pdfPrintDefaults.roleColumns = 1"
                  :class="[
                    'px-3 py-1 rounded-md transition cursor-pointer text-sm',
                    pdfPrintDefaults.roleColumns === 1
                      ? 'bg-[color:var(--color-active)] text-[color:var(--color-text)]'
                      : 'bg-[color:var(--color-border)] text-[color:var(--color-bg)] hover:bg-[color:var(--color-hover-bg)]'
                  ]"
              >1</button>
              <button
                  @click="pdfPrintDefaults.roleColumns = 2"
                  :class="[
                    'px-3 py-1 rounded-md transition cursor-pointer text-sm',
                    pdfPrintDefaults.roleColumns === 2
                      ? 'bg-[color:var(--color-active)] text-[color:var(--color-text)]'
                      : 'bg-[color:var(--color-border)] text-[color:var(--color-bg)] hover:bg-[color:var(--color-hover-bg)]'
                  ]"
              >2</button>
            </div>
            <!-- Roles/Rows slider inline -->
            <span class="text-sm font-medium text-theme">{{ pdfPrintDefaults.roleColumns === 1 ? $t('options.rolesPerPage') : $t('options.rowsPerPage') }}</span>
            <input
                v-if="pdfPrintDefaults.roleColumns === 1"
                type="range"
                :min="15"
                :max="25"
                :step="1"
                v-model.number="pdfPrintDefaults.rolesPerPage"
                class="w-32 accent-[color:var(--color-active)]"
            />
            <input
                v-else
                type="range"
                :min="8"
                :max="13"
                :step="1"
                v-model.number="pdfPrintDefaults.rowsPerPage"
                class="w-32 accent-[color:var(--color-active)]"
            />
            <span class="text-sm text-theme w-6">{{ pdfPrintDefaults.roleColumns === 1 ? pdfPrintDefaults.rolesPerPage : pdfPrintDefaults.rowsPerPage }}</span>
          </div>
          <!-- Night Order -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 min-w-[180px]">
              <span class="text-sm font-medium text-theme">{{ $t('options.showNightOrder') }}</span>
              <tooltip
                  :triggers="['hover', 'focus']"
                  placement="top"
                  :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
                  popper-class="nightorder-option-tooltip">
                <template #default>
                  <div class="cursor-pointer">
                    <icon-element name="info" size="w-5 h-5" />
                  </div>
                </template>
                <template #popper>
                  <div class="flex flex-row gap-4 p-2">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.compactDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_nightorder_compact.png'" :alt="$t('options.compactDisplay')" img-class="rounded" style="height: 250px; width: auto;" />
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.fullDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_nightorder_full.png'" :alt="$t('options.fullDisplay')" img-class="rounded" style="height: 250px; width: auto;" />
                    </div>
                  </div>
                </template>
              </tooltip>
              <input type="checkbox" v-model="pdfPrintDefaults.showNightOrder" class="h-4 w-4 cursor-pointer accent-[color:var(--color-active)]" />
            </div>
            <div v-if="pdfPrintDefaults.showNightOrder" class="flex items-center gap-2">
              <span :class="['text-xs transition-colors', pdfPrintDefaults.nightOrderDisplayMode === 'compact' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.compactDisplay') }}</span>
              <button
                  @click="pdfPrintDefaults.nightOrderDisplayMode = pdfPrintDefaults.nightOrderDisplayMode === 'full' ? 'compact' : 'full'"
                  :class="['relative w-10 h-5 rounded-full transition-colors cursor-pointer', pdfPrintDefaults.nightOrderDisplayMode === 'full' ? 'bg-[color:var(--color-active)]' : 'bg-[color:var(--color-border)]']">
                <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', pdfPrintDefaults.nightOrderDisplayMode === 'full' ? 'left-5.5' : 'left-0.5']"></span>
              </button>
              <span :class="['text-xs transition-colors', pdfPrintDefaults.nightOrderDisplayMode === 'full' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.fullDisplay') }}</span>
            </div>
          </div>
          <!-- Djinn -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-theme">{{ $t('options.showDjinn') }}</span>
              <tooltip
                  :triggers="['hover', 'focus']"
                  placement="top"
                  :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
                  popper-class="djinn-option-tooltip">
                <template #default>
                  <div class="cursor-pointer">
                    <icon-element name="info" size="w-5 h-5" />
                  </div>
                </template>
                <template #popper>
                  <div class="flex flex-col gap-4 p-2">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.compactDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_djinn_compact.png'" :alt="$t('options.compactDisplay')" img-class="rounded" style="width: 300px; height: auto;" />
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.fullDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_djinn_full.png'" :alt="$t('options.fullDisplay')" img-class="rounded" style="width: 300px; height: auto;" />
                    </div>
                  </div>
                </template>
              </tooltip>
              <input type="checkbox" v-model="pdfPrintDefaults.showDjinn" class="h-4 w-4 cursor-pointer accent-[color:var(--color-active)]" />
            </div>
            <div v-if="pdfPrintDefaults.showDjinn" class="flex items-center gap-2">
              <span :class="['text-xs transition-colors', pdfPrintDefaults.djinnDisplayMode === 'compact' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.compactDisplay') }}</span>
              <button
                  @click="pdfPrintDefaults.djinnDisplayMode = pdfPrintDefaults.djinnDisplayMode === 'full' ? 'compact' : 'full'"
                  :class="['relative w-10 h-5 rounded-full transition-colors cursor-pointer', pdfPrintDefaults.djinnDisplayMode === 'full' ? 'bg-[color:var(--color-active)]' : 'bg-[color:var(--color-border)]']">
                <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', pdfPrintDefaults.djinnDisplayMode === 'full' ? 'left-5.5' : 'left-0.5']"></span>
              </button>
              <span :class="['text-xs transition-colors', pdfPrintDefaults.djinnDisplayMode === 'full' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.fullDisplay') }}</span>
            </div>
          </div>
          <!-- Bootlegger -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 min-w-[180px]">
              <span class="text-sm font-medium text-theme">{{ $t('options.showBootlegger') }}</span>
              <tooltip
                  :triggers="['hover', 'focus']"
                  placement="top"
                  :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
                  popper-class="bootlegger-option-tooltip">
                <template #default>
                  <div class="cursor-pointer">
                    <icon-element name="info" size="w-5 h-5" />
                  </div>
                </template>
                <template #popper>
                  <div class="flex flex-col gap-4 p-2">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.compactDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_bootlegger_compact.png'" :alt="$t('options.compactDisplay')" img-class="rounded" style="width: 300px; height: auto;" />
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.fullDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_bootlegger_full.png'" :alt="$t('options.fullDisplay')" img-class="rounded" style="width: 300px; height: auto;" />
                    </div>
                  </div>
                </template>
              </tooltip>
              <input type="checkbox" v-model="pdfPrintDefaults.showBootlegger" class="h-4 w-4 cursor-pointer accent-[color:var(--color-active)]" />
            </div>
            <div v-if="pdfPrintDefaults.showBootlegger" class="flex items-center gap-2">
              <span :class="['text-xs transition-colors', pdfPrintDefaults.bootleggerDisplayMode === 'compact' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.compactDisplay') }}</span>
              <button
                  @click="pdfPrintDefaults.bootleggerDisplayMode = pdfPrintDefaults.bootleggerDisplayMode === 'full' ? 'compact' : 'full'"
                  :class="['relative w-10 h-5 rounded-full transition-colors cursor-pointer', pdfPrintDefaults.bootleggerDisplayMode === 'full' ? 'bg-[color:var(--color-active)]' : 'bg-[color:var(--color-border)]']">
                <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', pdfPrintDefaults.bootleggerDisplayMode === 'full' ? 'left-5.5' : 'left-0.5']"></span>
              </button>
              <span :class="['text-xs transition-colors', pdfPrintDefaults.bootleggerDisplayMode === 'full' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.fullDisplay') }}</span>
            </div>
          </div>
          <!-- Travellers, Fabled, Loric -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 min-w-[180px]">
              <span class="text-sm font-medium text-theme">{{ $t('options.showTravellersFabledLoric') }}</span>
              <tooltip
                  :triggers="['hover', 'focus']"
                  placement="top"
                  :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
                  popper-class="tfl-option-tooltip">
                <template #default>
                  <div class="cursor-pointer">
                    <icon-element name="info" size="w-5 h-5" />
                  </div>
                </template>
                <template #popper>
                  <div class="flex flex-col gap-4 p-2">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.compactDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_tfl_compact.png'" :alt="$t('options.compactDisplay')" img-class="rounded" style="width: 450px; height: auto;" />
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-medium mb-2">{{ $t('options.fullDisplay') }}</span>
                      <cached-image :src="'/images/elements/ui/pdf_options/show_tfl_full.png'" :alt="$t('options.fullDisplay')" img-class="rounded" style="width: 450px; height: auto;" />
                    </div>
                  </div>
                </template>
              </tooltip>
              <input type="checkbox" v-model="pdfPrintDefaults.showTravellersFabledLoric" class="h-4 w-4 cursor-pointer accent-[color:var(--color-active)]" />
            </div>
            <div v-if="pdfPrintDefaults.showTravellersFabledLoric" class="flex items-center gap-2">
              <span :class="['text-xs transition-colors', pdfPrintDefaults.travellersFabledLoricDisplayMode === 'compact' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.compactDisplay') }}</span>
              <button
                  @click="pdfPrintDefaults.travellersFabledLoricDisplayMode = pdfPrintDefaults.travellersFabledLoricDisplayMode === 'full' ? 'compact' : 'full'"
                  :class="['relative w-10 h-5 rounded-full transition-colors cursor-pointer', pdfPrintDefaults.travellersFabledLoricDisplayMode === 'full' ? 'bg-[color:var(--color-active)]' : 'bg-[color:var(--color-border)]']">
                <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', pdfPrintDefaults.travellersFabledLoricDisplayMode === 'full' ? 'left-5.5' : 'left-0.5']"></span>
              </button>
              <span :class="['text-xs transition-colors', pdfPrintDefaults.travellersFabledLoricDisplayMode === 'full' ? 'text-theme font-medium' : 'text-[color:var(--color-placeholder-text)]']">{{ $t('options.fullDisplay') }}</span>
            </div>
          </div>
          <!-- Table -->
          <div class="flex items-center gap-4">
            <simple-checkbox
                div-class="flex items-center gap-2 min-w-[180px]"
                label-class="text-sm font-medium text-theme"
                :label="$t('options.showTable')"
                v-model:value="pdfPrintDefaults.showTable" />
          </div>
          <!-- Page Numbers -->
          <div class="flex items-center gap-4">
            <simple-checkbox
                div-class="flex items-center gap-2 min-w-[180px]"
                label-class="text-sm font-medium text-theme"
                :label="$t('options.showPageNumbers')"
                v-model:value="pdfPrintDefaults.showPageNumbers" />
          </div>
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
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
import PdfOptionTooltip from "@/components/ui/PdfOptionTooltip.vue";
import {Tooltip} from "floating-vue";
import IconElement from "@/components/ui/IconElement.vue";
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
import {useOptionsStore} from "@/store/options";
import CachedImage from "@/components/ui/CachedImage.vue";

const { t } = useI18n()

const props = defineProps({
  isOpen: Boolean,
  isBootleggersEnabled: Boolean
})

const craftStore = useCraftStore()
const optionsStore = useOptionsStore()
const { pdfMeta, activeScriptIndex, activeVersion, isSavedScript, tags, isEditingScript } = storeToRefs(craftStore)
const { pdfPrintDefaults, tooltipDelay } = storeToRefs(optionsStore)
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
<style>
.nightorder-option-tooltip {
  max-width: none !important;
}
.nightorder-option-tooltip .v-popper__inner {
  max-width: none !important;
  max-height: none !important;
}
.djinn-option-tooltip {
  max-width: none !important;
}
.djinn-option-tooltip .v-popper__inner {
  max-width: none !important;
  max-height: none !important;
}
.bootlegger-option-tooltip {
  max-width: none !important;
}
.bootlegger-option-tooltip .v-popper__inner {
  max-width: none !important;
  max-height: none !important;
}
.tfl-option-tooltip {
  max-width: none !important;
}
.tfl-option-tooltip .v-popper__inner {
  max-width: none !important;
  max-height: none !important;
}
</style>
