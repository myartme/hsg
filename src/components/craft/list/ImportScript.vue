<template>
  <sector-container
      :name="instance?.type.name"
      :is-show-sticky="isCanSave && isFullData">
    <template #sticky>
      <action-button v-if="isFullData"
          icon="save"
          icon-size="w-6 h-6"
          button-class="w-10 h-10"
          :handle="save">
      </action-button>
      <action-button v-if="isFullData"
          icon="undo"
          icon-size="w-7 h-7"
          button-class="w-10 h-10"
          handle="" />
    </template>
    <template #header>
      <h2 class="text-2xl font-bold">{{ label }}</h2>
    </template>
    <template #content>
      <import-script-textarea
          :value="importContent"
          @create-meta="meta = $event"
          @create-list="list = $event" />
      <simple-input
          v-model:value="meta.name"
          label="Name"
          :maxlength="50"
          required="This field is required."
          class="mb-2" />
      <simple-input
          v-model:value="meta.author"
          label="Author"
          :maxlength="50"
          tooltip="Default version for this field is <b>Unknown</b>"
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
        <simple-input-tag
            v-model:value="meta.bootlegger"
            div-class="mt-2"
            label="Bootlegger rules"
            :max-tags="10"
            :maxlength="250"
            tooltip="Bootlegger rules for this script." />
      <simple-textarea
          v-model:value="meta.note"
          label="Note"
          :maxlength="5000"
          rows="6"
          class="mt-2"
          tooltip="Your custom notes." />
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
    </template>
  </sector-container>
</template>
<script setup>
import {computed, getCurrentInstance, ref, watch} from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import {EMPTY_IMPORT_SCRIPT} from "@/constants/roles";
import SectorContainer from "@/components/SectorContainer.vue";
import {useIndexStore} from "@/store";
import {isEqual} from "lodash/lang";
import {SET_INDEX} from "@/constants/other";
import ImportScriptTextarea from "@/components/craft/list/ImportScriptTextarea.vue";
import {useCraftStore} from "@/store/craft";
import SimpleInputTag from "@/components/ui/SimpleInputTag.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import {activeScriptIndex} from "@/store/craft/state";

defineOptions({
  name: 'import-script'
})

const props = defineProps({
  label: String
})

const instance = getCurrentInstance()
const craftStore = useCraftStore()
const indexStore = useIndexStore()
const meta = ref({ ...EMPTY_IMPORT_SCRIPT })
const list = ref({})
const importContent = ref("")
const isVisibleError = ref(false)
const isCanSave = ref(false)

const isFullData = computed(() => {
  return !isVisibleError.value &&
      !!meta.value.id &&
      !!meta.value.name
})

const getEmptyValue = () => ({ ...EMPTY_IMPORT_SCRIPT })

function save(){
  try{
    craftStore.saveImportScript(meta.value, list.value)
    isCanSave.value = false
    indexStore.unfocusWindow()
    activeScriptIndex.value = SET_INDEX.DEFAULT
    return true
  } catch (e){
    return false
  }
}

watch(meta, (newVal) => {
  isCanSave.value = !isEqual(newVal, getEmptyValue())
}, { deep: true })

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>