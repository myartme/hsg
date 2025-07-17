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
          label="Name"
          :maxlength="50"
          required="This field is required."
          info="Changing this value will be considered a new script!"
          tooltipIcon="info"
          :different="meta.different?.name ? 'This value in the current version doesn\'t match the default value for the script.<br>Save the current version to update.' : ''"
          class="mb-2" />
      <simple-input
          v-model:value="meta.author"
          label="Author"
          :maxlength="50"
          info="This value is common to all versions of the script. Default version for this field is <b>Unknown</b>"
          :different="meta.different?.author ? 'This value in the current version doesn\'t match the default value for the script.<br>Save the current version to update.' : ''"
          class="mb-2" />
      <simple-input
          v-model:value="meta.almanac"
          label="Almanac"
          :maxlength="250"
          info="This value is common to all versions of the script."
          :different="meta.different?.almanac ? 'This value in the current version doesn\'t match the default value for the script.<br>Save the current version to update.' : ''"
          class="mb-2" />
      <simple-checkbox
          v-model:value="meta.hideTitle"
          label="Hide Title"
          info="You can hide script's title.<br>This value is common to all versions of the script."
          :different="meta.different?.hideTitle ? 'This value in the current version doesn\'t match the default value for the script.<br>Save the current version to update.' : ''"/>
        <template v-if="!isEmpty(bootleggerOptions)">
          <simple-input-tag
              v-model:value="rules"
              div-class="mt-2"
              label="Bootlegger rules"
              :max-tags="10"
              :maxlength="250"
              info="Bootlegger rules for this script." />
          <simple-dropdown
              label="Character's bootlegger"
              info="Bootlegger rules for all characters contained in the current script."
              div-class="mt-2"
              v-model:value="rule"
              :list="bootleggerOptions"
              default-value="Add Bootlegger..." />
        </template>
      <simple-textarea
          v-model:value="meta.note"
          label="Note"
          :maxlength="5000"
          rows="6"
          class="mt-2"
          info="Your custom note." />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <simple-input
            v-model:value="meta.logo"
            label="Logo"
            :maxlength="250"
            info="This value is common to all versions of the script."
            :different="meta.different?.logo ? 'This value in the current version doesn\'t match the default value for the script.<br>Save the current version to update.' : ''"
            class="mb-2" />
        <simple-input
            v-model:value="meta.background"
            label="Background"
            :maxlength="250"
            info="This value is common to all versions of the script."
            :different="meta.different?.background ? 'This value in the current version doesn\'t match the default value for the script.<br>Save the current version to update.' : ''"
            class="mb-2" />
        <img v-if="meta.logo" :src="meta.logo" class="mt-10 h-50 object-cover rounded mx-auto" alt="logo">
        <img v-if="meta.background" :src="meta.background" class="mt-10 h-50 object-cover rounded mx-auto" alt="background">
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

const props = defineProps({
  isOpen: Boolean,
  bootlegger: {
    type: Object,
    default: []
  }
})

const craftStore = useCraftStore()
const { pdfMeta, pdfListWithParams, activeScriptIndex, activeVersion, isSavedScript } = storeToRefs(craftStore)
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
const rule = ref(null)
const emits = defineEmits(['update:isOpen'])
const bootleggerOptions = computed(() => {
  return Object.values(pdfListWithParams.value)
      .flat()
      .flatMap(el => props.bootlegger[el.id]?.rules || [])
})

function closeWindow(){
  pdfMeta.value['bootlegger'] = rules.value
  emits('update:isOpen', !props.isOpen)
}

function handleDeleteScript(){
  craftStore.deleteScripts(meta.value?.name)
  router.push({ name: 'scriptList' })
  activeScriptIndex.value = SET_INDEX.DEFAULT
  activeVersion.value = DEFAULT_VERSION
}

watch(rule, (newVal) => {
  if (newVal && !rules.value.includes(newVal) && rules.value.length < 10) {
    rules.value = [...rules.value, newVal]
    rule.value = ""
  }
})

watch(pdfMeta, (newVal) => {
  meta.value = newVal
},{ immediate: true, deep: true})

watch(() => pdfMeta.value?.bootlegger, (newVal) => {
  rules.value = Array.isArray(newVal) ? [...newVal] : []
}, { immediate: true })
</script>