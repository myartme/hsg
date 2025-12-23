<template>
  <sector-container
      :name="instance?.type.name"
      :is-show-sticky="isCanSave">
    <template #sticky>
      <action-button v-if="isFullData"
          icon="save"
          icon-size="w-6 h-6"
          button-class="w-10 h-10"
          :handle="saveData" />
      <action-button
          icon="revert"
          icon-size="w-7 h-7"
          button-class="w-10 h-10"
          :handle="undoUpdate" />
    </template>
    <template #header>
      <h2 class="text-2xl font-semibold">{{ isNew ? $t('character.createCharacter') : $t('character.editCharacter') }}</h2>
      <action-button v-if="isOfficial"
               icon="wiki"
               icon-size="w-7 h-7"
               button-class="w-10 h-10"
               :tooltip="$t('character.goToWiki')"
               @click="optionsStore.openLinkinBrowser(character?.wiki)" />
      <action-button v-if="!isNew"
                     icon="toClipboard"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     :tooltip="$t('character.copyToClipboard')"
                     :handle="handleToClipboard"
                     :is-show-effect="true" />
      <action-button v-if="!isOfficial && !isNew"
                     icon="delete"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     :tooltip="$t('character.deleteCharacter')"
                     @click="isVisibleDeleteDialog = true" />
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <simple-input
            @input="checkName"
            v-model:value="character.name"
            :label="$t('character.name')"
            :disabled="isOfficial || !isNew"
            :required="$t('validation.fieldRequiredNoEdit')"
            :errored="isVisibleError"
            :error-text="errorText"
            :maxlength="30" />
        <simple-dropdown
            v-model:value="character.team"
            :label="$t('character.team')"
            :list="ROLES"
            :disabled="isOfficial"
            :required="$t('validation.fieldRequired')"
            :default-value="$t('character.selectRoleType')" />
        <simple-textarea
            v-model:value="character.ability"
            :label="$t('character.ability')"
            :disabled="isOfficial"
            rows="6"
            :required="$t('validation.fieldRequired')"
            :maxlength="250" />
        <simple-textarea
            v-model:value="character.flavor"
            :label="$t('character.flavorText')"
            :disabled="isOfficial"
            rows="6"
            :maxlength="500" />
        <night-orders
            v-if="!isEmpty(character.name)"
            v-model:character="firstNightCharacter"
            v-model:list="firstNightOrderList"
            :action-text="isOfficial ? $t('character.clickToViewFirstNight') : $t('character.clickToSetFirstNight')"
            :label="$t('character.firstNightPriority')"
            input-class="border border-gray-300 rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm focus:ring-violet-500 form-input"
            :info="$t('info.firstNightPriority')"
            :disabled="isOfficial"
            order-field="firstNight" />
        <night-orders
            v-if="!isEmpty(character.name)"
            v-model:character="otherNightCharacter"
            v-model:list="otherNightOrderList"
            :action-text="isOfficial ? $t('character.clickToViewOtherNight') : $t('character.clickToSetOtherNight')"
            :label="$t('character.otherNightPriority')"
            input-class="border border-gray-300 rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm focus:ring-violet-500 form-input"
            :info="$t('info.otherNightPriority')"
            :disabled="isOfficial"
            order-field="otherNight" />
      </div>
      <div>
        <simple-input-tag
            v-model:value="character.reminders"
            div-class="mb-4"
            :label="$t('character.reminders')"
            :max-tags="20"
            :disabled="isOfficial"
            :info="$t('info.reminders')" />
        <simple-input-tag
            v-model:value="character.remindersGlobal"
            div-class="mb-4"
            :label="$t('character.remindersGlobal')"
            :max-tags="20"
            :disabled="isOfficial"
            :info="$t('info.remindersGlobal')" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <simple-textarea
            v-model:value="character.firstNightReminder"
            :label="$t('character.firstNightReminder')"
            :maxlength="500"
            :disabled="isOfficial"
            rows="10"
            :info="$t('info.firstNightReminder')" />
        <simple-textarea
            v-model:value="character.otherNightReminder"
            :label="$t('character.otherNightReminder')"
            :maxlength="500"
            :disabled="isOfficial"
            rows="10"
            :info="$t('info.otherNightReminder')" />
      </div>
      <simple-checkbox
          v-model:value="character.setup"
          div-class="flex items-center space-x-2 mt-2"
          :label="$t('character.setup')"
          :disabled="isOfficial"
          :info="$t('info.setup')" />
      <group-images
          v-if="!isImagesDisabled"
          v-model:value="character.image"
          :team-name="character.team"
          :key="character.id"
          div-class="pt-3 pb-3"
          :label="$t('character.icons')"
          :disabled="isOfficial" />
      <queue-positions-input
          v-if="!isQueuePositionDisabled"
          v-model:character="queueCharacter"
          v-model:list="queueList"
          :action-text="isOfficial ? $t('character.clickToViewScriptPriority') : $t('character.clickToSetScriptPriority')"
          :label="$t('character.scriptCharacterPriority')"
          :team-name="character.team"
          :info="$t('info.scriptCharacterPriority')"
          :required="$t('validation.fieldRequired')"
          :disabled="isOfficial" />
      <specials v-if="!isOfficial"
                v-model:value="specials"
                :label="$t('character.specials')"
                @on-update-specials="specials = [...$event]"
                :action-text="$t('character.clickToEditSpecials')"/>
      <group-jinx
          v-model:value="character.jinxes"
          :label="$t('character.jinxes')"
          :maxlength="500"
          :disabled="isOfficial"
          :info="$t('info.jinxes')" />
      <simple-input-tag
          v-model:value="rules"
          div-class="mt-4"
          :label="$t('character.bootleggerRules')"
          :max-tags="10"
          :maxlength="250"
          :placeholder="$t('scriptEditor.bootleggerRulesInfo')"
          :info="$t('info.bootleggerRules')" />
      <confirm-dialog v-if="isVisibleDeleteDialog"
                      :title="$t('character.deletingCharacter', { name: character.name })"
                      :description="$t('character.deleteCharacterConfirm')"
                      @confirm="remove"
                      @cancel="isVisibleDeleteDialog = false" />
    </template>
  </sector-container>
</template>

<script setup>
import {computed, getCurrentInstance, ref, watch, watchEffect} from "vue";
import {useI18n} from "vue-i18n";
import {EMPTY_CHARACTER, MAIN_ROLES, ROLES, stripDefaults} from "@/constants/roles.js";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, getImageFirstUrl, objectToPrettyJson, toNormalizeString, validateName} from "@/constants/other";
import { useLibraryStore } from "@/store/library";
import { storeToRefs } from "pinia";
import {useIndexStore} from "@/store";
import {isArray, isEmpty, isEqual} from "lodash/lang";
import SectorContainer from "@/components/SectorContainer.vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import SimpleTextarea from "@/components/ui/SimpleTextarea.vue";
import NightOrders from "@/components/library/RoleEditor/NightOrders.vue";
import SimpleInputTag from "@/components/ui/SimpleInputTag.vue";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import GroupImages from "@/components/library/RoleEditor/GroupImages.vue";
import GroupJinx from "@/components/library/RoleEditor/GroupJinx.vue";
import QueuePositionsInput from "@/components/library/RoleEditor/QueuePositions.vue";
import {useOptionsStore} from "@/store/options";
import Specials from "@/components/library/RoleEditor/Specials.vue";

defineOptions({
  name: 'edit-form'
})

const props = defineProps({
  isNew: {
    type: Boolean,
    default: false
  }
})
const { t } = useI18n()
const instance = getCurrentInstance()
const indexStore = useIndexStore()
const libraryStore = useLibraryStore()
const optionsStore = useOptionsStore()
const { activeList, activeMeta, activeCharacter, nightOrder, queuePositions, bootlegger } = storeToRefs(libraryStore)
const errorText = ref(null)
const isVisibleError = ref(false)
const character = ref(null)
const isVisibleDeleteDialog = ref(false)
const isCanSaveChar = ref(false)
const isCanSaveTags = ref(false)
const isCanSaveRules = ref(false)
const isCanSaveQueue = ref(false)
const isCanSaveNight = ref(false)
const isCanSaveSpecial = ref(false)
const rules = ref(null)
const specials = ref(null)
const queueList = ref([])
const queueCharacter = ref({})
const firstNightOrderList = ref([])
const firstNightCharacter = ref([])
const otherNightOrderList = ref([])
const otherNightCharacter = ref([])
const emits = defineEmits(['createRole'])

const isCanSave = computed(() => isCanSaveChar.value || isCanSaveTags.value || isCanSaveRules.value || isCanSaveQueue.value || isCanSaveNight.value || isCanSaveSpecial.value)
const setCanSave = (val) => {
  isCanSaveChar.value = val
  isCanSaveTags.value = val
  isCanSaveRules.value = val
  isCanSaveQueue.value = val
  isCanSaveNight.value = val
  isCanSaveSpecial.value = val
}

const isOfficial = computed(() => {
  if(optionsStore.debugMode) return false
  return activeMeta.value.isOfficial ?? false
})

const isQueuePositionDisabled = computed(() => {
  return !MAIN_ROLES.find(el => el === character.value?.team) || isEmpty(character.value?.name)
})

const isImagesDisabled = computed(() => {
  return !ROLES.find(el => el === character.value?.team)
})

const isFullData = computed(() => {
  return !isVisibleError.value &&
  character.value.name !== '' &&
  character.value.team !== '' &&
  character.value.ability !== '' &&
  (
      ['townsfolk', 'outsider', 'minion', 'demon'].includes(character.value.team)
      ? queueCharacter.value.scriptCharacterPriority > 0
      : true
  )
})

const characterInit = () => {
  character.value = { ...activeCharacter.value }
}

const bootleggerInit = () => {
  rules.value = getDefaultRules()
}

const nightOrderListInit = () => {
  if(isArray(nightOrder.value?.firstNight)){
    firstNightOrderList.value = [...nightOrder.value.firstNight]
  }
  if(isArray(nightOrder.value?.otherNight)){
    otherNightOrderList.value = [...nightOrder.value.otherNight]
  }
}

const queueListInit = () => {
  if(isArray(queuePositions.value[character.value.team])){
    queueList.value = [...queuePositions.value[character.value.team]]
  }
}

const firstNightOrderInit = () => {
  if(firstNightOrderList.value){
    const elem = firstNightOrderList.value?.find(el => el.id === character.value.id)
    if(elem){
      firstNightCharacter.value = elem
      return
    }
  }

  firstNightCharacter.value = {
    "id": character.value.id,
    "image": getImageFirstUrl(character.value),
    "name": character.value.name,
    "ability": character.value.ability,
  }
}
const otherNightOrderInit = () => {
  if(otherNightOrderList.value){
    const elem = otherNightOrderList.value?.find(el => el.id === character.value.id)
    if(elem){
      otherNightCharacter.value = elem
      return
    }
  }

  otherNightCharacter.value = {
    "id": character.value.id,
    "image": getImageFirstUrl(character.value),
    "name": character.value.name,
    "ability": character.value.ability,
  }
}

const queueInit = () => {
  if(queueList.value){
    const elemIdx = queueList.value?.findIndex(el => el.id === character.value.id)
    if(elemIdx !== -1){
      queueCharacter.value = queueList.value[elemIdx]
      return
    }
  }

  queueCharacter.value = {
    "id": character.value.id,
    "image": getImageFirstUrl(character.value),
    "name": character.value.name,
    "ability": character.value.ability,
    "scriptCharacterPriority": 0
  }
}

const specialsInit = () => {
  specials.value = activeCharacter.value.specials || []
}

function getDefaultRules(){
  if(activeCharacter.value){
    const elem = bootlegger.value[activeCharacter.value.team]?.find(el => el.id === activeCharacter.value.id)
    if(elem)
      return [...elem.rules]
  }

  return []
}

function checkName(event) {
  const str = event.target.value

  // Валидация имени (недопустимые символы, * не в конце)
  const validation = validateName(str)
  if (!validation.valid) {
    isVisibleError.value = true
    errorText.value = validation.error
    return
  }

  if (str === activeCharacter.value?.name) {
    isVisibleError.value = false
    return
  }

  // Проверка дубликата
  const isDuplicate = Object.values(activeList.value)
      .some(roleList => roleList.some(el => el.name === str))

  if (isDuplicate) {
    isVisibleError.value = true
    errorText.value = t('validation.characterExists')
    return
  }

  isVisibleError.value = false
}

function saveData(){
  try{
    character.value = stripDefaults(character.value, EMPTY_CHARACTER)
    queuePositions.value[character.value.team] = [...queueList.value]
    nightOrder.value = {"firstNight": firstNightOrderList.value, "otherNight": otherNightOrderList.value}

    const indexBootlegger = bootlegger.value[character.value?.team].findIndex(el => el.id === character?.value.id)
    const bootleggerElement = () => {
      return {
        id: character.value.id,
        image: getImageFirstUrl(character.value),
        name: character.value.name,
        ability: character.value.ability,
        rules: rules.value
      }
    }

    if(indexBootlegger >= 0){
      bootlegger.value[character.value?.team][indexBootlegger] = bootleggerElement()
    } else {
      bootlegger.value[character.value?.team].push(bootleggerElement())
    }

    libraryStore.saveActiveCharacter(character.value)
    if(props.isNew){
      emits('createRole')
    }

    setTimeout(() => {
      setCanSave(false)
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    console.log(e)
    return false
  }
}

function undoUpdate() {
  try {
    characterInit()
    nightOrderListInit()
    firstNightOrderInit()
    otherNightOrderInit()
    queueListInit()
    queueInit()
    bootleggerInit()
    specialsInit()
    setTimeout(() => {
      setCanSave(false)
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e) {
    return false
  }
}

function handleToClipboard(){
  try {
    navigator.clipboard.writeText(objectToPrettyJson(character.value))
    return true

  } catch {
    return false
  }
}

function remove(){
  isVisibleDeleteDialog.value = false
  libraryStore.deleteActiveCharacter()
}

watch(character, () => {
  isCanSaveChar.value = !isEqual(character.value, activeCharacter.value)
}, { deep:true })

watch(queueCharacter, () => {
  if(!MAIN_ROLES.includes(character.value.team)) {
    isCanSaveQueue.value = false
    return
  }
  const stored = queuePositions.value[character.value.team]?.find(el => el.id === character.value.id)
  isCanSaveQueue.value = !isEqual(queueCharacter.value, stored)
}, { deep:true })

const checkNightOrderChanged = () => {
  const firstNightStored = nightOrder.value?.firstNight.find(el => el.id === character.value.id)
  const otherNightStored = nightOrder.value?.otherNight.find(el => el.id === character.value.id)

  const firstChanged = firstNightCharacter.value?.firstNight > 0 || firstNightStored
      ? !isEqual(firstNightCharacter.value, firstNightStored)
      : false

  const otherChanged = otherNightCharacter.value?.otherNight > 0 || otherNightStored
      ? !isEqual(otherNightCharacter.value, otherNightStored)
      : false

  isCanSaveNight.value = firstChanged || otherChanged
}

watch(firstNightCharacter, checkNightOrderChanged, { deep: true })
watch(otherNightCharacter, checkNightOrderChanged, { deep: true })

watch(rules, () => {
  isCanSaveRules.value = !isEqual(rules.value, getDefaultRules())
}, { deep:true })

watch(() => character.value?.name, (newVal) => {
  if(!newVal) return
  if(props.isNew){
    let name = character.value.name
    if(character.value.edition){
      name = `${name}_${character.value.edition}`
    }
    character.value.id = toNormalizeString(name, 30)
  }

  if(queueCharacter.value){
    const elemIdx = queueList.value.findIndex(el => el.id === queueCharacter.value.id)
    queueCharacter.value = {...queueCharacter.value, "id": character.value.id, "name": newVal}
    queueList.value[elemIdx] = queueCharacter.value
  }
  if(firstNightOrderList.value){
    const elemIdx = firstNightOrderList.value.findIndex(el => el.id === firstNightCharacter.value.id)
    firstNightCharacter.value = {...firstNightCharacter.value, "id": character.value.id, "name": newVal}
    firstNightOrderList.value[elemIdx] = firstNightCharacter.value
  }
  if(otherNightOrderList.value){
    const elemIdx = otherNightOrderList.value.findIndex(el => el.id === otherNightOrderList.value.id)
    firstNightCharacter.value = {...firstNightCharacter.value, "id": character.value.id, "name": newVal}
    otherNightOrderList.value[elemIdx] = otherNightOrderList.value
  }
})

watch(() => character.value?.ability, (newVal) => {
  if(!newVal) return
  if(queueCharacter.value){
    queueCharacter.value.ability = newVal
  }
  if(firstNightCharacter.value){
    firstNightCharacter.value.ability = newVal
  }
  if(otherNightCharacter.value){
    otherNightCharacter.value.ability = newVal
  }
})

watch(() => character.value?.image, (newVal) => {
  if(!newVal) return
  const image = getImageFirstUrl(character.value)
  if(queueCharacter.value){
    queueCharacter.value.image = image
  }
  if(firstNightCharacter.value){
    firstNightCharacter.value.image = image
  }
  if(otherNightCharacter.value){
    otherNightCharacter.value.image = image
  }
}, {deep: true})

watch(() => character.value?.team, (newVal, lastVal) => {
  if(newVal !== lastVal){
    queueListInit()
  }
  firstNightCharacter.value.image = getImageFirstUrl(character.value)
  otherNightCharacter.value.image = getImageFirstUrl(character.value)

})

watch(activeCharacter, () => {
  characterInit()
  nightOrderListInit()
  firstNightOrderInit()
  otherNightOrderInit()
  queueListInit()
  queueInit()
  bootleggerInit()
  specialsInit()
}, { deep:true, immediate:true })

watchEffect(() => {
  isCanSave.value ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>