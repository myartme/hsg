<template>
  <sector-container container-class="h-[70px] items-center border-b-2 title-theme border-[color:var(--color-border)] select-none" content-class="" :is-background-enabled="false" :name="instance?.type.name">
    <template #content>
      <nav class="flex justify-between items-center h-16 px-8 py-4">
        <div class="text-2xl font-bold tracking-wide">Blood on the Clocktower Homebrew Script Generator</div>
        <div v-if="debugMode" class="text-2xl font-bold text-[color:var(--color-button-error)]">DEBUG TRUE</div>
        <div class="flex space-x-20 text-sm font-medium">
          <router-link v-for="(link, name) in menuElements"
                       :to="link"
                       class="text-lg"
                       active-class="font-bold text-[color:var(--color-menu-active)]">{{name}}</router-link>
        </div>
      </nav>
    </template>
  </sector-container>
</template>
<script setup>
import SectorContainer from "@/components/SectorContainer.vue";
import {getCurrentInstance} from "vue";
import {appVersion, debugMode} from "@/store/options/state";
defineOptions({
  name: 'app-menu'
})

const instance = getCurrentInstance()
const menuElements = {
  "Character Library": "/",
  "Script List": "/scripts",
  "Options": "/options",
}
</script>