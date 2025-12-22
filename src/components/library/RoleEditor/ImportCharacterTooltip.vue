<template>
  <div class="flex gap-1 mt-1 overflow-hidden">
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
        <div style="width: 740px; padding-right: 12px;">
          <span v-html="$t('importCharacter.info')"></span>
          <img src="/images/elements/ui/character_options.png" alt="Character options" />
        </div>
      </template>
    </tooltip>
    <tooltip
        :triggers="['hover', 'focus']"
        placement="top"
        content="tooltip"
        popper-class="import-warning-tooltip"
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
.import-tooltip .v-popper__inner {
  min-width: 740px;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
.import-warning-tooltip .v-popper__inner {
  max-width: 400px;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
