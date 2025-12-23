<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="closeWindow">
    <template #header>
      <div class="flex items-center gap-2 pl-0 pb-1">
        <h2 class="text-xl font-bold title-theme">{{ $t('nightOrder.title') }}</h2>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="align-middle">
          <div class="flex items-center">
            <h2 class="text-lg font-semibold text-theme">{{ $t('nightOrder.firstNight') }}</h2>
            <action-button v-if="!isFirstNightDefault"
                           icon="revert"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           :tooltip="$t('tooltips.restoreDefaultOrder')"
                           :is-show-effect="true"
                           :handle="() => firstNight = defaultResetFirstNight()"
                           class="ml-2" />
            <action-button v-if="isSavedScript && !isFirstNightSameAsSave"
                           icon="undoToSave"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           :tooltip="$t('tooltips.restoreToLastSave')"
                           :is-show-effect="true"
                           :handle="resetFirstNightToSave"
                           class="ml-2" />
          </div>
          <div class="flex gap-4 mt-2">
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.current') }}</h3>
              <draggable-component v-model="firstNight" item-key="id" :move="checkMove">
                <template #item="{ element }">
                  <night-order-element :value="getElement(element)" :is-default-element="defaultNightArray.includes(element)" />
                </template>
              </draggable-component>
            </div>
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.default') }}</h3>
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
            <h2 class="text-lg font-semibold text-theme">{{ $t('nightOrder.otherNights') }}</h2>
            <action-button v-if="!isOtherNightDefault"
                           icon="revert"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           :tooltip="$t('tooltips.restoreDefaultOrder')"
                           :is-show-effect="true"
                           :handle="() => otherNight = defaultResetOtherNight()"
                           class="ml-2" />
            <action-button v-if="isSavedScript && !isOtherNightSameAsSave"
                           icon="undoToSave"
                           icon-size="w-8 h-8"
                           button-class="w-10 h-10"
                           :tooltip="$t('tooltips.restoreToLastSave')"
                           :is-show-effect="true"
                           :handle="resetOtherNightToSave"
                           class="ml-2" />
          </div>
          <div class="flex gap-4 mt-2">
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.current') }}</h3>
              <draggable-component v-model="otherNight" item-key="id" :move="checkMove">
                <template #item="{ element }">
                  <night-order-element :value="getElement(element)" :is-default-element="defaultNightArray.includes(element)" />
                </template>
              </draggable-component>
            </div>
            <div class="flex flex-col">
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.default') }}</h3>
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
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import PopupContainer from "@/components/PopupContainer.vue";
import {cloneDeep, isEmpty, isEqual} from "lodash/lang";
import draggableComponent from "vuedraggable";
import NightOrderElement from "@/components/craft/pdf/NightOrderElement.vue";
import {getImageFirstUrl} from "@/constants/other";
import ActionButton from "@/components/ui/ActionButton.vue";
import {pushState, ACTION_TYPES} from "@/store/craft/history";

const { t } = useI18n()

const props = defineProps({
  isOpen: Boolean
})

const craftStore = useCraftStore()
const { pdfMeta, pdfListWithParams, isOpenNightOrder, isEditingScript, nightOrderAutoGenerated, isSavedScript } = storeToRefs(craftStore)
const firstNight = ref([])
const otherNight = ref([])
const rolesList = ref()
const originalFirstNight = ref([])
const originalOtherNight = ref([])
const emits = defineEmits(['update:isOpen'])
const defaultNightArray = ['dusk', 'minioninfo', 'demoninfo', 'dawn']

const firstNightDefault = () => pdfMeta.value.firstNight || defaultNightArray
const otherNightDefault = () => pdfMeta.value.otherNight || ['dusk', 'dawn']

const isFirstNightDefault = computed(() => isEqual(firstNight.value, defaultResetFirstNight()))
const isOtherNightDefault = computed(() => isEqual(otherNight.value, defaultResetOtherNight()))

const isFirstNightSameAsSave = computed(() => {
  const saved = !isEmpty(originalFirstNight.value) ? originalFirstNight.value : defaultResetFirstNight()
  return isEqual(firstNight.value, saved)
})

const isOtherNightSameAsSave = computed(() => {
  const saved = !isEmpty(originalOtherNight.value) ? originalOtherNight.value : defaultResetOtherNight()
  return isEqual(otherNight.value, saved)
})

function closeWindow(){
  const hasChanges = !isEqual(originalFirstNight.value, firstNight.value) || !isEqual(originalOtherNight.value, otherNight.value)
  if(hasChanges){
    // Save state for undo before applying changes
    pushState(ACTION_TYPES.CHANGE_NIGHT_ORDER, pdfMeta.value.name)
    isEditingScript.value = true
  }
  pdfMeta.value.firstNight = firstNight.value
  pdfMeta.value.otherNight = otherNight.value
  emits('update:isOpen', !props.isOpen)
}

function checkMove(evt) {
  const draggedElement = evt.draggedContext.element
  const futureIndex = evt.draggedContext.futureIndex

  // dusk должен оставаться первым
  if (draggedElement === 'dusk') return false
  // нельзя переместить на первую позицию (выше dusk)
  if (futureIndex === 0) return false

  return true
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

  // Инициализируем оригинальные значения при первой загрузке
  if(isEmpty(originalFirstNight.value)){
    originalFirstNight.value = cloneDeep(pdfMeta.value.firstNight) || []
  }
  if(isEmpty(originalOtherNight.value)){
    originalOtherNight.value = cloneDeep(pdfMeta.value.otherNight) || []
  }

  const hasRoles = Object.values(pdfListWithParams.value).flat().length > 0
  if(hasRoles && (isEmpty(pdfMeta.value.firstNight) || isEmpty(pdfMeta.value.otherNight))){
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

watch(isOpenNightOrder, (isOpen) => {
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

  // Save original state when popup opens
  if (isOpen) {
    originalFirstNight.value = [...firstNight.value]
    originalOtherNight.value = [...otherNight.value]
  }
},{ immediate: true, deep: true })
</script>