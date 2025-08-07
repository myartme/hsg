<template>
  <div class="mt-1 overflow-hidden">
    <tooltip
        :triggers="['hover', 'focus']"
        placement="top"
        content="tooltip"
        popper-class="import-tooltip"
        :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
    >
      <template #default>
        <div class="cursor-pointer">
          <icon-element name="info" size="w-5 h-5" />
        </div>
      </template>
      <template #popper>
        <div style="width: 740px;">
          You can import one or more characters. Required fields for a character: "name", "team", "ability".
          <img src="/images/elements/ui/character_options.png" alt="Character options" />
        </div>
      </template>
    </tooltip>
  </div>
</template>
<script setup>
import IconElement from "@/components/ui/IconElement.vue";
import {Tooltip} from "floating-vue";
import {storeToRefs} from "pinia";
import {useOptionsStore} from "@/store/options";

const optionsStore = useOptionsStore()
const { tooltipDelay } = storeToRefs(optionsStore)
</script>
<style>
.import-tooltip .v-popper__inner {
  min-width: 740px;
}
</style>