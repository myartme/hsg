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
          icon="undo"
          icon-size="w-7 h-7"
          button-class="w-10 h-10"
          :handle="undoUpdate" />
    </template>
    <template #header>
      <h2 class="text-2xl font-semibold">{{ isNew ? 'Create' : 'Edit' }} Character</h2>
      <action-button v-if="isOfficial"
               icon="wiki"
               icon-size="w-7 h-7"
               button-class="w-10 h-10"
               tooltip="Go to the Blood on the Clocktower Wiki"
               @click="optionsStore.openLinkinBrowser(character?.wiki)" />
      <action-button v-if="!isOfficial && !isNew"
                     icon="toClipboard"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     tooltip="Copy character data to clipboard"
                     :handle="handleToClipboard"
                     :is-show-effect="true" />
      <action-button v-if="!isOfficial && !isNew"
                     icon="delete"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     tooltip="Delete this character"
                     @click="isVisibleDeleteDialog = true" />
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <simple-input
            @input="checkName"
            v-model:value="character.name"
            label="Name"
            :disabled="isOfficial || !isNew"
            required="This field is required. After saving, changing the name is not available."
            :errored="isVisibleError"
            :error-text="errorText"
            :maxlength="30" />
        <simple-dropdown
            v-model:value="character.team"
            label="Team"
            :list="ROLES"
            :disabled="isOfficial"
            required="This field is required."
            default-value="Select Role Type..." />
        <simple-textarea
            v-model:value="character.ability"
            label="Ability"
            :disabled="isOfficial"
            rows="6"
            required="This field is required."
            :maxlength="250" />
        <simple-textarea
            v-model:value="character.flavor"
            label="Flavor text"
            :disabled="isOfficial"
            rows="6"
            :maxlength="500" />
        <night-orders
            v-model:value="character.firstNight"
            :character="character"
            :action-text="isOfficial ? 'Click to view first night priority' : 'Click to set first night priority'"
            label="First Night Priority"
            input-class="border border-gray-300 rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm focus:ring-violet-500 form-input"
            info="First night wake-up priority. &quot;0&quot; means this character doesn't wake during the first night."
            :disabled="isOfficial"
            order-field="firstNight" />
        <night-orders
            v-model:value="character.otherNight"
            :character="character"
            :action-text="isOfficial ? 'Click to view other night priority' : 'Click to set other night priority'"
            label="Other Night Priority"
            input-class="border border-gray-300 rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm focus:ring-violet-500 form-input"
            info="Other nights wake-up priority. &quot;0&quot; means this character doesn't wake during other nights."
            :disabled="isOfficial"
            order-field="otherNight" />
      </div>
      <div>
        <simple-input-tag
            v-model:value="character.reminders"
            div-class="mb-4"
            label="Reminders"
            :max-tags="20"
            :disabled="isOfficial"
            info="Character reminder tokens." />
        <simple-input-tag
            v-model:value="character.remindersGlobal"
            div-class="mb-4"
            label="Reminders Global"
            :max-tags="20"
            :disabled="isOfficial"
            info="Global character reminder tokens, which will be selectable even when the character is not in play." />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <simple-textarea
            v-model:value="character.firstNightReminder"
            label="First Night Reminder"
            :maxlength="500"
            :disabled="isOfficial"
            rows="10"
            info="First night Storyteller reminder." />
        <simple-textarea
            v-model:value="character.otherNightReminder"
            label="Other Night Reminder"
            :maxlength="500"
            :disabled="isOfficial"
            rows="10"
            info="Other night Storyteller reminder." />
      </div>
      <simple-input
          v-model:value="character.edition"
          div-class="mb-4 mt-3"
          :disabled="true"
          label="Edition" />
      <simple-checkbox
          v-model:value="character.setup"
          label="Setup"
          :disabled="isOfficial"
          info="Whether this character has a ability that is relevant for the game setup." />
      <group-images
          v-if="!isImagesDisabled"
          v-model:value="character.image"
          :team-name="character.team"
          :key="character.id"
          div-class="pt-3 pb-3"
          label="Icons"
          :disabled="isOfficial"
          info="For non-traveller characters, the icons should be regular alignment and flipped alignment, for travellers they should be unaligned, good alignment and evil alignment." />
      <queue-positions-input
          v-if="!isQueuePositionDisabled"
          :action-text="isOfficial ? 'Click to view script queue position' : 'Click to set script queue position'"
          label="Script Character Priority"
          :character="queueCharacter"
          :team-name="character.team"
          :queue="queue"
          info="The priority of this character on the script sheet. The &quot;Team&quot; field is required fot this field."
          required="This field is required."
          :disabled="isOfficial"
          @update-character="queueCharacter = $event"
          @update-queue="queue = $event" />
      <group-jinx
          v-model:value="character.jinxes"
          label="Jinxes"
          :maxlength="500"
          :disabled="isOfficial"
          info="Jinxes with other characters on this script." />
      <simple-input-tag
          v-model:value="rules"
          div-class="mt-4"
          label="Bootlegger rules"
          :max-tags="10"
          :maxlength="250"
          info="Bootlegger rules for this character.<br>Don't forget to add bootlegger fabled in the script to see the bootlegger rules in options." />
      <confirm-dialog v-if="isVisibleDeleteDialog"
                      :title="`Deleting ${character.name}`"
                      description="This action cannot be undone. Are you sure you want to delete this character?"
                      @confirm="remove"
                      @cancel="isVisibleDeleteDialog = false" />
    </template>
  </sector-container>
</template>

<script setup>
import {computed, getCurrentInstance, ref, watch, watchEffect} from "vue";
import {EMPTY_CHARACTER, MAIN_ROLES, ROLES, stripDefaults} from "@/constants/roles.js";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME, getImageArray, getImageFirstUrl, isEqualWithDefault, objectToPrettyJson, toNormalizeString} from "@/constants/other";
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

defineOptions({
  name: 'edit-form'
})

const props = defineProps({
  isNew: {
    type: Boolean,
    default: false
  }
})
const instance = getCurrentInstance()
const indexStore = useIndexStore()
const libraryStore = useLibraryStore()
const optionsStore = useOptionsStore()
const { activeList, activeMeta, activeCharacter, queuePositions, bootlegger } = storeToRefs(libraryStore)
const errorText = ref(null)
const isVisibleError = ref(false)
const character = ref(null)
const isVisibleDeleteDialog = ref(false)
const isCanSaveChar = ref(false)
const isCanSaveTags = ref(false)
const isCanSaveRules = ref(false)
const isCanSaveQueue = ref(false)
const rules = ref(null)
const queueCharacter = ref(null)
const queue = ref(null)
const emits = defineEmits(['createRole'])

const isCanSave = computed(() => isCanSaveChar.value || isCanSaveTags.value || isCanSaveRules.value || isCanSaveQueue.value)
const setCanSave = (val) => {
  isCanSaveChar.value = val
  isCanSaveTags.value = val
  isCanSaveRules.value = val
  isCanSaveQueue.value = val
}

const isOfficial = computed(() => {
  if(optionsStore.debugMode) return false
  return activeMeta.value.isOfficial ?? false
})

const isQueuePositionDisabled = computed(() => {
  return !MAIN_ROLES.find(el => el === character.value?.team)
})

const isImagesDisabled = computed(() => {
  return !ROLES.find(el => el === character.value?.team)
})

const isFullData = computed(() => {
  return !isVisibleError.value &&
  character.value.name !== '' &&
  character.value.team !== '' &&
  character.value.ability !== '' &&
  ['townsfolk', 'outsider', 'minion', 'demon'].includes(character.value.team)
      ? queueCharacter.value?.scriptCharacterPriority > 0
      : ['traveller', 'fabled'].includes(character.value.team)
})

const characterInit = () => {
  character.value = { ...activeCharacter.value }
}

const bootleggerInit = () => {
  rules.value = getDefaultRules()
}

const queueInit = () => {
  queueCharacter.value = getDefaultQueueCharacter()

  if(queuePositions.value && character.value?.team && MAIN_ROLES.find(el => el === character.value?.team)){
    queue.value = [...queuePositions.value[character.value?.team] || []]
  } else {
    queue.value = []
  }
}

function getDefaultRules(){
  if(activeCharacter.value){
    const elem = bootlegger.value[activeCharacter.value.team]?.find(el => el.id === activeCharacter.value.id)
    if(elem)
      return [...elem.rules]
  }

  return []
}

function getDefaultQueueCharacter(){
  if(activeCharacter.value && MAIN_ROLES.includes(activeCharacter.value.team)){
    const elem = queuePositions.value[activeCharacter.value.team]?.find(el => el.id === activeCharacter.value.id)
    if(elem) return {...elem, ...{image:getImageFirstUrl(elem)} }
  }

  return {
    "id": activeCharacter.value.id,
    "image": getImageFirstUrl(activeCharacter.value) || '',
    "name": activeCharacter.value.name,
    "ability": activeCharacter.value.ability,
    "scriptCharacterPriority": 0
  }
}

function getImage(val){
  if(isArray(val) && !isEmpty(val)){
    return val[0]
  } else if(typeof val === 'string'){
    return val
  }

  return ''
}

function checkName(event) {
  const str = event.target.value
  if (str === activeCharacter.value.name) return

  const isDuplicate = Object.values(activeList.value)
      .some(roleList => roleList.some(el => el.name === str))

  if (isDuplicate) {
    isVisibleError.value = true
    errorText.value = "There is already a character with this name"
    return
  }

  isVisibleError.value = false
}

function saveData(){
  try{
    if(props.isNew){
      let name = character.value.name
      if(character.value.edition){
        name = `${name}_${character.value.edition}`
      }
      character.value.id = toNormalizeString(name, 30)
    }

    character.value = stripDefaults(character.value, EMPTY_CHARACTER)

    const indexQueue = queue.value.findIndex(el => el.id === character?.value.id || el.id === '')

    const queueElement = () => {
      return {
        id: character.value.id,
        image: getImageFirstUrl(character.value),
        name: character.value.name,
        ability: character.value.ability,
        scriptCharacterPriority: queue.value[indexQueue]?.scriptCharacterPriority || 0
      }
    }

    if(indexQueue >= 0){
      queuePositions.value[character.value?.team][indexQueue] = queueElement()
    }

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
    queueInit()
    bootleggerInit()
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
  if(!character.value.setup){
    delete character.value.setup
  }

  queueCharacter.value = {
    "id": character.value.id,
    "image": getImage(character.value.image),
    "name": character.value.name,
    "ability": character.value.ability,
    "scriptCharacterPriority": queueCharacter.value.scriptCharacterPriority || 0
  }

  isCanSaveChar.value = !isEqualWithDefault(character.value, activeCharacter.value)
}, { deep:true })

watch(() => character?.value?.team, (newTeam, oldTeam) => {
  if(newTeam !== oldTeam){
    queueInit()
  }

  queueCharacter.value = {
    "id": character.value.id,
    "image": getImage(character.value.image),
    "name": character.value.name,
    "ability": character.value.ability,
    "scriptCharacterPriority": queueCharacter.value.scriptCharacterPriority || 0
  }

  if(!!newTeam && !getImageFirstUrl(character.value)){
    character.value.image = [...getImageArray(character.value.image, newTeam)]
  }
})

watch(rules, () => {
  isCanSaveRules.value = !isEqual(rules.value, getDefaultRules())
}, { deep:true })

watch(queueCharacter, () => {
  isCanSaveQueue.value = !isEqual(queueCharacter.value, getDefaultQueueCharacter())
}, { deep:true })

watch(activeCharacter, () => {
  characterInit()
  queueInit()
  bootleggerInit()
}, { deep:true, immediate:true })

watchEffect(() => {
  isCanSave.value ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})
</script>