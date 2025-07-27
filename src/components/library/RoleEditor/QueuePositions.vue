<template>
  <div class="flex items-center mb-4">
    <div class="flex-1">
      <input-title-block
          :label-class="labelClass"
          :model-length="queuePosition > 0 ? queuePosition : 0"
          :label="label"
          :required="required"
          :info="info" />
      <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition border-[color:var(--color-border)] text-theme"
           @click="isOpen = true">
        <span v-if="queuePosition > 0">{{ queuePosition }}</span>
        <span v-else>{{ actionText }}</span>
      </div>
    </div>
    <popup-container
        v-if="isOpen"
        :is-input-visible="true"
        :input-value="queuePosition"
        :is-disabled="disabled"
        @close="closeAndSave"
        @on-input-change="onInputChange">
      <template #header>
        {{ disabled ? 'View' : 'Choose' }} {{ label }}
      </template>
      <template #content>
        <draggable-component v-model="roles" item-key="id" :move="isMoved" @change="onDragChange">
          <template #item="{ element }">
            <div :ref="isCurrent(element) ? 'currentForScroll' : null">
              <popup-horizontal-list-element
                  :name="element.name"
                  :ability="element.ability"
                  :value="element.scriptCharacterPriority"
                  :element="element"
                  :is-current="isCurrent(element)" />
            </div>
          </template>
        </draggable-component>
      </template>
    </popup-container>
  </div>
</template>
<script setup>
import {computed, nextTick, ref, watch} from "vue";
import draggableComponent from "vuedraggable";
import {DEFAULT_MIN_TIME} from "@/constants/other";
import {MAIN_ROLES} from "@/constants/roles";
import {isEqual} from "lodash/lang";
import PopupHorizontalListElement from "@/components/library/RoleEditor/PopupHorizontalListElement.vue";
import PopupContainer from "@/components/PopupContainer.vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const props = defineProps({
  label: String,
  actionText: String,
  teamName: String,
  character: Object,
  queue: Object,
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
  },
  info: {
    type: String,
    default: "",
  },
  required: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(false)
const orderChar = ref({})
const roles = ref([])
const currentForScroll = ref(null)
const emits = defineEmits(['updateCharacter', 'updateQueue'])

const isCurrent = (role) => role.id === props.character.id
const queuePosition = computed({
  get: () => orderChar.value.scriptCharacterPriority,
  set: (val) => { orderChar.value.scriptCharacterPriority = val }
})

const scrollToCurrent = () => {
  nextTick(() => {
    setTimeout(() => {
      if (isOpen.value && currentForScroll.value) {
        currentForScroll.value.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }, DEFAULT_MIN_TIME)
  })
}

const scrollIfOutOfView = (elRef) => {
  const el = Array.isArray(elRef?.value) ? elRef.value[0] : elRef?.value;

  if (!el || typeof el.getBoundingClientRect !== "function") {
    return;
  }

  const rect = el.getBoundingClientRect();
  const isOutOfView =
      rect.top < 0 ||
      rect.bottom > window.innerHeight ||
      rect.left < 0 ||
      rect.right > window.innerWidth;

  if (isOutOfView) {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
  }
}

function getRoleList() {
  if(!MAIN_ROLES.find(el => el === props.teamName)) return []
  return props.queue
      .slice()
      .sort((a, b) => a.scriptCharacterPriority - b.scriptCharacterPriority)
      .map((el, i) => ({ ...el, scriptCharacterPriority: i + 1 }))
}

function getPosition() {
  if(!MAIN_ROLES.find(el => el === props.teamName) || !props.character || !Array.isArray(props.queue)) return 0;
  const elem = props.queue.find(el => {
    return el.id === props.character.id
  })

  return elem === undefined ? 0 : elem.scriptCharacterPriority
}

function updateRolesAndPositions(){
  roles.value
      .sort((a, b) => a.scriptCharacterPriority - b.scriptCharacterPriority)
      .forEach((el, i) => {
        el.scriptCharacterPriority = i + 1
      })

  nextTick(() => {
    scrollIfOutOfView(currentForScroll);
  });
}

function closeAndSave(){
  emits('updateCharacter', orderChar.value)
  emits('updateQueue', roles.value)
  isOpen.value = false
}

function isMoved(evt) {
  return !props.disabled && isCurrent(evt.draggedContext.element)
}

function setOrderChar(){
  orderChar.value = props.character
  queuePosition.value = getPosition()
  roles.value = getRoleList()
  const index = roles.value.findIndex(el => el.id === orderChar.value.id)
  if(index !== -1){
    roles.value[index] = orderChar.value
  }
}

function onInputChange(event){
  const oldIndex = roles.value.findIndex(el => el.id === orderChar.value.id)
  let eventValue = Number(event.target.value)
  queuePosition.value = eventValue > 0 ? eventValue : 0
  if(eventValue > 0){
    if (oldIndex === -1) {
      addValue(orderChar.value)
    } else {
      watcherValue(queuePosition.value - 1, oldIndex)
    }
  } else {
    removeValue(oldIndex);
  }

  event.target.value = queuePosition.value;
}

function addValue(index){
  roles.value.unshift(index);
  updateRolesAndPositions()
}

function watcherValue(newIndex, oldIndex) {
  if(newIndex > oldIndex){
    for(let i = oldIndex; i < newIndex; i++){
      roles.value[i] = roles.value[i + 1]
    }
  } else {
    for(let i = oldIndex; i > newIndex; i--){
      roles.value[i] = roles.value[i - 1]
    }
  }
  roles.value[newIndex] = orderChar.value

  updateRolesAndPositions()
}

function removeValue(index){
  roles.value.splice(index, 1);
  updateRolesAndPositions()
}

function onDragChange(event){
  const { newIndex } = event.moved
  roles.value.forEach((el, i) => {
    el.scriptCharacterPriority = i + 1
  })

  queuePosition.value = newIndex + 1
}

watch(isOpen, (newVal) => {
  if(newVal) scrollToCurrent()
})

watch(() => props.character, () => {
  if(isEqual(orderChar.value, props.character)) return
  setOrderChar()
}, {immediate:true, deep:true})

watch(() => props.teamName, () => {
  setOrderChar()
}, {immediate:true})
</script>