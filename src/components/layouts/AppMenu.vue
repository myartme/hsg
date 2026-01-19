<template>
  <sector-container container-class="h-[70px] items-center border-b-2 title-theme border-[color:var(--color-border)] select-none" content-class="" :is-background-enabled="false" :name="instance?.type.name">
    <template #content>
      <nav class="flex justify-between items-center h-16 px-8 py-4">
        <div class="flex items-center gap-3">
          <cached-image :src="'/images/logo.png'" alt="Logo" img-class="w-10 h-10 rounded-lg opacity-70 saturate-[0.7]" />
          <div class="text-2xl font-bold tracking-wide">{{ $t('menu.appTitle') }}</div>
        </div>
        <div v-if="debugMode" class="text-2xl font-bold text-[color:var(--color-button-error)]">DEBUG TRUE</div>
        <div class="flex flex-nowrap items-center gap-2">
          <router-link v-for="item in menuElements"
                       :key="item.path"
                       :to="item.path"
                       class="px-4 py-2 rounded-full text-base font-medium transition-all duration-200 hover:bg-[color:var(--color-list-element)] whitespace-nowrap shrink-0"
                       active-class="!bg-[color:var(--color-menu-active)] !text-white">{{ item.label }}</router-link>
        </div>
      </nav>
    </template>
  </sector-container>
</template>
<script setup>
import SectorContainer from "@/components/SectorContainer.vue";
import CachedImage from "@/components/ui/CachedImage.vue";
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