<template>
  <div class="flex gap-1 mt-1 overflow-hidden">
    <tooltip
        :triggers="['hover', 'focus']"
        placement="bottom"
        content="tooltip"
        popper-class="import-set-tooltip"
        :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
    >
      <template #default>
        <div class="cursor-pointer">
          <icon-element name="info" size="w-5 h-5" />
        </div>
      </template>
      <template #popper>
        <div style="width: 770px; padding-right: 12px;">
          <span v-html="$t('importCharacter.info')"></span>
          <img src="/images/elements/ui/set_options.png" alt="Set options" />
        </div>
      </template>
    </tooltip>
    <tooltip
        :triggers="['hover', 'focus']"
        placement="bottom"
        content="tooltip"
        popper-class="import-set-warning-tooltip"
        :delay="{ show: tooltipDelay.infoShow, hide: tooltipDelay.infoHide }"
    >
      <template #default>
        <div class="cursor-pointer">
          <icon-element name="warning" size="w-5 h-5" color="fill-yellow-500 hover:fill-yellow-400" />
        </div>
      </template>
      <template #popper>
        <ul class="text-yellow-400 list-disc pl-4">
          <li v-html="$t('importCharacter.noteId')"></li>
          <li>{{ $t('importCharacter.noteName') }}</li>
          <li v-html="$t('importCharacter.noteDeprecated')"></li>
          <li v-html="$t('importCharacter.noteScriptQueue')"></li>
        </ul>
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
.import-set-tooltip .v-popper__inner {
  min-width: 770px;
  overflow: hidden;
}
.import-set-warning-tooltip .v-popper__inner {
  max-width: 400px;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
