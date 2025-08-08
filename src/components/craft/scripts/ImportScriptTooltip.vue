<template>
  <div class="mt-1 overflow-hidden">
    <tooltip
        :triggers="['hover', 'focus']"
        placement="top"
        content="tooltip"
        popper-class="import-script-tooltip"
        :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
    >
      <template #default>
        <div class="cursor-pointer">
          <icon-element name="info" size="w-5 h-5" />
        </div>
      </template>
      <template #popper>
        <div style="width: 420px;">You can import script. Minimum required fields:
          <img src="/images/elements/ui/script_options.png" alt="Script options" />
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
.import-script-tooltip .v-popper__inner {
  min-width: 420px;
  overflow: hidden;
}
</style>