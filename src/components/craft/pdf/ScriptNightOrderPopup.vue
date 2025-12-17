<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="closeWindow">
    <template #header>
      <div class="flex items-center gap-2 pl-0 pb-1">
        <h2 class="text-xl font-bold title-theme">Night Order</h2>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="align-middle">
          <div class="flex items-center">
            <h2 class="text-lg font-semibold text-theme">First Night</h2>
            <action-button v-if="!isFirstNightDefault"
                           icon="undo"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           tooltip="Restore default order"
                           :is-show-effect="true"
                           :handle="() => firstNight = defaultResetFirstNight()"
                           class="ml-2" />
            <action-button v-if="!isFirstNightSameAsSave"
                           icon="undoToSave"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           tooltip="Restore to last save"
                           :is-show-effect="true"
                           :handle="resetFirstNightToSave"
                           class="ml-2" />
          </div>
          <div class="flex gap-4 mt-2">
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">Current</h3>
              <draggable-component v-model="firstNight" item-key="id">
                <template #item="{ element }">
                  <night-order-element :value="getElement(element)" :is-default-element="defaultNightArray.includes(element)" />
                </template>
              </draggable-component>
            </div>
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">Default</h3>
              <div class="opacity-50 pointer-events-none">
                <night-order-element
                    v-for="element in defaultResetFirstNight()"
                    :key="element"
                    :value="getElement(element)"
                    :is-default-element="defaultNightArray.includes(element)" />
              </div>
            </div>
          </div>
        </div>
        <div class="align-middle">
          <div class="flex items-center">
            <h2 class="text-lg font-semibold text-theme">Other Nights</h2>
            <action-button v-if="!isOtherNightDefault"
                           icon="undo"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           tooltip="Restore default order"
                           :is-show-effect="true"
                           :handle="() => otherNight = defaultResetOtherNight()"
                           class="ml-2" />
            <action-button v-if="!isOtherNightSameAsSave"
                           icon="undoToSave"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           tooltip="Restore to last save"
                           :is-show-effect="true"
                           :handle="resetOtherNightToSave"
                           class="ml-2" />
          </div>
          <div class="flex gap-4 mt-2">
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">Current</h3>
              <draggable-component v-model="otherNight" item-key="id">
                <template #item="{ element }">
                  <night-order-element :value="getElement(element)" :is-default-element="defaultNightArray.includes(element)" />
                </template>
              </draggable-component>
            </div>
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">Default</h3>
              <div class="opacity-50 pointer-events-none">
                <night-order-element
                    v-for="element in defaultResetOtherNight()"
                    :key="element"
                    :value="getElement(element)"
                    :is-default-element="defaultNightArray.includes(element)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </popup-container>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import PopupContainer from "@/components/PopupContainer.vue";
import {isEmpty, isEqual} from "lodash/lang";
import draggableComponent from "vuedraggable";
import NightOrderElement from "@/components/craft/pdf/NightOrderElement.vue";
import {getImageFirstUrl} from "@/constants/other";
import ActionButton from "@/components/ui/ActionButton.vue";

const props = defineProps({
  isOpen: Boolean
})

const craftStore = useCraftStore()
const { pdfMeta, pdfListWithParams, isOpenNightOrder, isEditingScript, nightOrderAutoGenerated } = storeToRefs(craftStore)
const firstNight = ref([])
const otherNight = ref([])
const rolesList = ref()
const emits = defineEmits(['update:isOpen'])
const defaultNightArray = ['dusk', 'minioninfo', 'demoninfo', 'dawn']

const firstNightDefault = () => pdfMeta.value.firstNight || defaultNightArray
const otherNightDefault = () => pdfMeta.value.otherNight || ['dusk', 'dawn']

const isFirstNightDefault = computed(() => isEqual(firstNight.value, defaultResetFirstNight()))
const isOtherNightDefault = computed(() => isEqual(otherNight.value, defaultResetOtherNight()))

const isFirstNightSameAsSave = computed(() => {
  const saved = !isEmpty(pdfMeta.value.firstNight) ? pdfMeta.value.firstNight : defaultResetFirstNight()
  return isEqual(firstNight.value, saved)
})

const isOtherNightSameAsSave = computed(() => {
  const saved = !isEmpty(pdfMeta.value.otherNight) ? pdfMeta.value.otherNight : defaultResetOtherNight()
  return isEqual(otherNight.value, saved)
})

function closeWindow(){
  if(!isEqual(pdfMeta.value.firstNight, firstNight.value) || !isEqual(pdfMeta.value.otherNight, otherNight.value)){
    isEditingScript.value = true
  }
  pdfMeta.value.firstNight = firstNight.value
  pdfMeta.value.otherNight = otherNight.value
  emits('update:isOpen', !props.isOpen)
}

function getElement(element){
  if(defaultNightArray.includes(element)){
    return element
  } else {
    return getImageFirstUrl(rolesList.value.find(el => el.id === element))
  }
}

function defaultResetFirstNight(){
  if(isEmpty(rolesList.value)) return []
  return rolesList.value
      .filter(item => item.firstNight !== undefined)
      .sort((a, b) => a.firstNight - b.firstNight)
      .map(item => item.id)
}

function defaultResetOtherNight(){
  if(isEmpty(rolesList.value)) return []
  return rolesList.value
      .filter(item => item.otherNight !== undefined)
      .sort((a, b) => a.otherNight - b.otherNight)
      .map(item => item.id)
}

function resetFirstNightToSave(){
  if(!isEmpty(pdfMeta.value.firstNight)){
    firstNight.value = cloneDeep(pdfMeta.value.firstNight)
  } else {
    firstNight.value = defaultResetFirstNight()
  }
}

function resetOtherNightToSave(){
  if(!isEmpty(pdfMeta.value.otherNight)){
    otherNight.value = cloneDeep(pdfMeta.value.otherNight)
  } else {
    otherNight.value = defaultResetOtherNight()
  }
}

watch(pdfListWithParams, () => {
  rolesList.value = Object.values(pdfListWithParams.value).flat()
  rolesList.value = [
    ...rolesList.value,
    { id: 'dusk', firstNight: 0, otherNight: 0 },
    { id: 'minioninfo', firstNight: 13 },
    { id: 'demoninfo', firstNight: 18 },
    { id: 'dawn', firstNight: 10000, otherNight: 10000 }
  ]

  firstNight.value = defaultResetFirstNight()
  otherNight.value = defaultResetOtherNight()

  if(isEmpty(pdfMeta.value.firstNight) || isEmpty(pdfMeta.value.otherNight)){
    isEditingScript.value = true
    nightOrderAutoGenerated.value = true
  }

  if(isEmpty(pdfMeta.value.firstNight)){
    pdfMeta.value.firstNight = firstNight.value
  }
  if(isEmpty(pdfMeta.value.otherNight)){
    pdfMeta.value.otherNight = otherNight.value
  }
}, { immediate: true, deep: true })

watch(isOpenNightOrder, () => {
  const first = !isEmpty(firstNight.value) ? firstNight.value : defaultResetFirstNight()
  const other = !isEmpty(otherNight.value) ? otherNight.value : defaultResetOtherNight()

  if(!isEmpty(pdfMeta.value.firstNight)){
    firstNight.value = firstNightDefault()
        .filter(item => first.includes(item))
  } else if(isEmpty(firstNight.value)) {
    firstNight.value = first
  }
  if(!isEmpty(pdfMeta.value.otherNight)){
    otherNight.value = otherNightDefault()
        .filter(item => other.includes(item))
  } else if(isEmpty(otherNight.value)) {
    otherNight.value = other
  }
},{ immediate: true, deep: true })
</script>