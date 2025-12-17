<template>
  <sector-container container-class="h-[70px] items-center border-b-2 title-theme border-[color:var(--color-border)] select-none" content-class="" :is-background-enabled="false" :name="instance?.type.name">
    <template #content>
      <nav class="flex justify-between items-center h-16 px-8 py-4">
        <div class="text-2xl font-bold tracking-wide">{{ $t('menu.appTitle') }}</div>
        <div v-if="debugMode" class="text-2xl font-bold text-[color:var(--color-button-error)]">DEBUG TRUE</div>
        <div class="flex space-x-20 text-sm font-medium">
          <router-link v-for="item in menuElements"
                       :key="item.path"
                       :to="item.path"
                       class="text-lg"
                       active-class="font-bold text-[color:var(--color-menu-active)]">{{ item.label }}</router-link>
        </div>
      </nav>
    </template>
  </sector-container>
</template>
<script setup>
import SectorContainer from "@/components/SectorContainer.vue";
import {computed, getCurrentInstance} from "vue";
import {debugMode} from "@/store/options/state";
import {useI18n} from "vue-i18n";

defineOptions({
  name: 'app-menu'
})

const { t } = useI18n()
const instance = getCurrentInstance()
const menuElements = computed(() => [
  { label: t('menu.scriptList'), path: '/scripts' },
  { label: t('menu.characterLibrary'), path: '/library' },
  { label: t('menu.options'), path: '/options' }
])
</script>