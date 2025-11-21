<template>
  <div class="flex items-center mb-4">
    <div class="flex-1">
      <input-title-block
          :label-class="labelClass"
          :label="label" />
      <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition border-[color:var(--color-border)] text-theme"
           @click="isOpen = true">
        <span>{{ actionText }}</span>
      </div>
    </div>
    <popup-container
      v-if="isOpen"
      :is-input-visible="false"
      @close="isOpen = false; $emit('onUpdateSpecials', specials)">
      <template #header>
        <div class="flex space-x-3">
          <h2 class="text-xl font-bold title-theme">{{ label }}</h2>
          <action-button
              icon="add"
              icon-size="w-7 h-7"
              button-class="w-7 h-7"
              :is-pressed="false"
              :is-circle-type="false"
              tooltip="Add new feature"
              @click="createFeature" />
        </div>
      </template>
      <template #content>
        <div class="border border-[color:var(--color-border)] text-theme rounded-xl overflow-visible bg-[color:var(--color-bg)]">
          <button
              @click="formSwitcher()"
              class="w-full text-left px-4 py-2 flex justify-between rounded-xl items-center cursor-pointer bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]"
          >
            <span>{{ activeSpecial.index >= 0 ? `Edit Feature ${activeSpecial.index + 1}` : "Add Feature" }}</span>
            <span class="transition-transform" :class="{ 'rotate-180': isOpenForm }">
              <icon-element name="arrowDown" size="w-4 h-4" />
            </span>
          </button>
          <transition name="fade">
            <div
                v-if="isOpenForm"
                class="p-4"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <simple-dropdown
                    v-model:value="activeSpecial.type"
                    label="Type"
                    :list="types"
                    info="Currently supported values are:<br>selection - during character selection,<br>signal - during night signaling,<br>ability - when clicking on the character token,<br>vote - during a vote,<br>reveal - at the end of the game, before characters are revealed,<br>player - an ability that can be initiated by the player."
                    default-value="Select type" />
                <simple-dropdown
                    v-model:value="activeSpecial.name"
                    label="Name"
                    :list="names"
                    info="This is a list of the currently implemented special features and will be growing over time."
                    default-value="Select name" />
                <simple-dropdown
                    v-model:value="activeSpecial.time"
                    label="Time"
                    :list="times"
                    info="At which point during the game can the ability be used."
                    default-value="Select time" />
                <simple-dropdown
                    v-model:value="activeSpecial.global"
                    label="Global"
                    :list="globals"
                    info="If it's a global ability that can be used without the character being in play, this property defines on which characters it can be used. This does not work on Fabled, because they are not considered to be on the Script."
                    default-value="Select global" />
                <simple-input
                    v-model:value="activeSpecial.value"
                    label="Value"
                    :maxlength="50" />
                <div class="flex justify-center items-end">
                  <button
                      @click="addFeature"
                      class="px-4 py-2 rounded-xl whitespace-nowrap text-theme border-[color:var(--color-border)] cursor-pointer bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
        <div v-if="isShowContent">
          <div v-for="(special, i) in specials"
               :class="[
                   'rounded mt-5 mb-5 text-theme flex space-x-3 justify-start items-center',
                   {'no-click': isWaitingSpecialActionId !== i && isWaitingSpecialActionId !== -1 }
               ]">
              <special-line
                  :key-element="i"
                  :special="special"
                  :is-selected="activeSpecial.index === i"
                  @on-editing="editFeature(special, i)"
                  @on-waiting-action="isWaitingSpecialActionId = $event"
                  @on-deleting="deleteFeature(i)"
                  :key="i" />
          </div>
        </div>
    </template>
  </popup-container>
  </div>
</template>
<script setup>
import {ref, watch, nextTick} from "vue";
import PopupContainer from "@/components/PopupContainer.vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";
import SimpleDropdown from "@/components/ui/SimpleDropdown.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import IconElement from "@/components/ui/IconElement.vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import SpecialLine from "@/components/library/RoleEditor/SpecialLine.vue";
import {cloneDeep} from "lodash/lang";

const props = defineProps({
  label: String,
  actionText: String,
  value: {
    type: Array,
    default: []
  },
  divClass: {
    type: String
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  inputClass: {
    type: String,
    default: "border rounded-md px-3 py-2 h-10 w-full focus:outline-none form-input pr-16"
  }
})

const isOpen = ref(false)
const isOpenForm = ref(false)
const isShowContent = ref(true)
const specials = ref([])
const activeSpecial = ref({})
const isWaitingSpecialActionId = ref(-1)
const emits = defineEmits(['onUpdateSpecials'])

const types = ["selection", "ability", "signal", "vote", "reveal", "player"];
const names = ["grimoire", "pointing", "ghost-votes", "distribute-roles", "bag-disabled", "bag-duplicate", "multiplier", "hidden", "replace-character", "player", "card", "open-eyes"];
const times = ["pregame", "day", "night", "firstNight", "firstDay", "otherNight", "otherDay"];
const globals = ["townsfolk", "outsider", "minion", "demon", "traveller", "dead"];

function setDefaultActiveSpecial(){
  activeSpecial.value = {type: "", name: "", time: "", global: "", value: ""}
}

function createFeature() {
  setDefaultActiveSpecial()
  isOpenForm.value = true
}

async function addFeature() {
  isShowContent.value = false
  if(activeSpecial.value.index !== undefined && activeSpecial.value.index !== null){
    updateFeature()
  } else {
    saveFeature()
  }
  await nextTick(() => {
    isShowContent.value = true
  })
}

function saveFeature(){
  specials.value.push(activeSpecial.value)
  activeSpecial.value.index = specials.value.length - 1
}

function updateFeature(){
  const { index, ...specialData } = activeSpecial.value
  specials.value[index] = specialData
}

function editFeature(elem, key){
  activeSpecial.value = {
    index: key,
    type: elem.type ?? "",
    name: elem.name ?? "",
    time: elem.time ?? "",
    global: elem.global ?? "",
    value: elem.value ?? ""
  }
  isOpenForm.value = true
}

function deleteFeature(key){
  specials.value.splice(key, 1)
  activeSpecial.value = {}
  isWaitingSpecialActionId.value = -1
}

function formSwitcher(){
  isOpenForm.value = !isOpenForm.value
}

watch(props.value, () => {
  specials.value = cloneDeep(props.value)
}, { immediate: true })
</script>
<style scoped>
.no-click {
  pointer-events: none;
}
</style>