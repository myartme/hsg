<template>
  <div class="flex items-center mb-4">
    <div class="flex-1">
      <input-title-block
          :label-class="labelClass"
          :label="label"
          :required="required"
          :info="info" />
      <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition text-theme border-[color:var(--color-border)]"
           @click="isOpen = true">
        <span v-if="character[orderField] > 0">{{ character[orderField] }}</span>
        <span v-else>{{ actionText }}</span>
      </div>
    </div>
    <popup-container
        v-if="isOpen"
        :is-input-visible="!disabled || debugMode"
        :input-value="orderValue"
        :is-disabled="disabled"
        @close="closeAndSave"
        @on-input-change="onInputChange">
      <template #header>
        {{ disabled ? 'View' : 'Choose' }} {{ label }}
      </template>
      <template #content>
        <draggable-component v-model="roles" item-key="id" :move="isMoved" @change="onDragChange" @end="normalizeRoles">
          <template #item="{ element }">
            <div :ref="isCurrent(element) ? 'current' : null">
              <popup-horizontal-list-element
                  :name="element.name"
                  :ability="element.ability"
                  :value="element[orderField]"
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
import {nextTick, ref, watch} from "vue";
import draggableComponent from "vuedraggable";
import {DEFAULT_MIN_TIME, getImageFirstUrl} from "@/constants/other";
import PopupHorizontalListElement from "@/components/library/RoleEditor/PopupHorizontalListElement.vue";
import PopupContainer from "@/components/PopupContainer.vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";
import {debugMode} from "@/store/options/state";

const props = defineProps({
  label: String,
  character: Object,
  list: Array,
  actionText: String,
  orderField: String,
  divClass: {
    type: String
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  inputClass: {
    type: String,
    default: "border rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm form-input pr-16"
  },
  info: {
    type: String,
    default: "",
  },
  required: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(false)
const orderValue = ref(0)
const roles = ref([])
const current = ref(null)
const emit = defineEmits(['update:character', 'update:list'])

const isCurrent = (role) => role.id === props.character.id

const scrollToCurrent = () => {
  nextTick(() => {
    setTimeout(() => {
      if (isOpen.value && current.value) {
        current.value.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
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

function getElementWithValue(value){
  let elem = {
    "id": props.character.id,
    "image": getImageFirstUrl(props.character),
    "name": props.character.name,
    "ability": props.character.ability
  }
  if(props.orderField === "firstNight" || props.character?.firstNight){
    elem = {...elem, "firstNight": props.orderField === "firstNight" ? value : props.character?.firstNight}
  }
  if(props.orderField === "otherNight" || props.character?.otherNight){
    elem = {...elem, "otherNight": props.orderField === "otherNight" ? value : props.character?.otherNight}
  }

  return elem
}

function normalizeRoles() {
  roles.value = roles.value
      .sort((a, b) => a[props.orderField] - b[props.orderField])
      .map((el, idx) => ({
        ...el,
        [props.orderField]: idx,
      }))

  nextTick(() => {
    scrollIfOutOfView(current)
  });
}

function addToRolesList(value){
  let elIdx = roles.value.findIndex(el => el.id === props.character.id)
  if(elIdx === -1){
    roles.value.push(getElementWithValue(value - 1))
  } else {
    const elemCharPriority = roles.value[elIdx][props.orderField]
    roles.value.splice(elIdx, 1)
    roles.value.push(getElementWithValue(value > elemCharPriority ? value : value - 1))
  }
  normalizeRoles()
}

function removeFromRolesList(){
  let el = roles.value.findIndex(el => el.id === props.character.id)
  if(el !== -1){
    roles.value.splice(el, 1)
  }
  normalizeRoles()
  for(let idx = el; idx < roles.value.length; idx++){
    roles.value[idx][props.orderField] = idx
  }
}

function closeAndSave(){
  emit('update:character', getElementWithValue(orderValue.value))
  emit('update:list', roles.value)
  isOpen.value = false
}

function onInputChange(event){
  const position = Number(event.target.value)
  if(position >= 1){
    addToRolesList(position)
    orderValue.value = position
  } else {
    orderValue.value = 0
    removeFromRolesList()
  }
}

function isMoved(evt) {
  return !props.disabled && isCurrent(evt.draggedContext.element)
}

function onDragChange(event){
  const position = event.moved.newIndex
  addToRolesList(position)
  orderValue.value = position
  normalizeRoles()
}

watch(isOpen, (newVal) => {
  if(newVal) scrollToCurrent()
})

watch(() => props.character, (val) => {
  orderValue.value = val[props.orderField] || 0
  roles.value = props.list
}, {immediate: true, deep : true})
</script>