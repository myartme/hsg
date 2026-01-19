<template>
  <div class="max-h-screen overflow-y-auto" ref="pdfListWrapper">
  <div ref="pdfList">
    <!-- Страницы с ролями (A4: 210x297mm) -->
    <div v-for="(page, pageIndex) in rolePages" :key="'page-' + pageIndex"
         class="pdf-page bg-white w-[210mm] h-[297mm] overflow-hidden relative">
      <!-- Заголовок на каждой странице -->
      <div class="flex items-end ml-10 mt-3 mb-4">
        <h1 class="text-2xl font-semibold uppercase" style="font-family: 'Philosopher', sans-serif;">{{ pdfMeta.name }}</h1>
        <div class="flex items-baseline ml-auto gap-2">
          <span class="mr-5" style="color: rgb(75, 85, 99);">by</span>
          <span class="text-lg first-letter:uppercase mr-25" style="font-family: 'Cormorant Garamond', serif; font-style: italic;">{{ pdfMeta.author }}</span>
        </div>
      </div>
      <!-- Нижний колонтитул с номером страницы (не на первой) -->
      <div v-if="pageIndex > 0 && pdfPrintDefaults.showPageNumbers" class="absolute bottom-4 left-0 right-0 flex items-center">
        <div class="h-[1px] ml-10 flex-1" style="background-color: rgb(139, 115, 85);"></div>
        <span class="mx-4 mb-6 text-base" style="color: rgb(100, 25, 32); font-family: 'Cormorant Garamond', serif;">{{ pageIndex + 1 }}</span>
        <div class="h-[1px] mr-10 flex-1" style="background-color: rgb(139, 115, 85);"></div>
      </div>
      <!-- Роли на странице (2 колонки) -->
      <div v-if="pdfPrintDefaults.roleColumns === 2" class="mx-6 grid grid-cols-2 gap-x-6" :style="{ rowGap: rowGap + 'px' }">
        <template v-for="(item, itemIndex) in page.roles" :key="item.character.id">
          <!-- Пустая ячейка перед header, если предыдущий ряд неполный -->
          <div v-if="item.needEmptyCell" class="h-[60px]"></div>
          <!-- Заголовок команды (на всю ширину) -->
          <team-header v-if="item.showTeamHeader" :team="item.team" :compact="true" class="col-span-2 mt-2" />
          <!-- Персонаж (фиксированная высота, контент выезжает за пределы) -->
          <div class="flex items-center ml-1 h-[60px] overflow-visible">
            <!-- Иконка слева -->
            <div class="w-13 h-13 flex-shrink-0 mr-2 relative top-[6.5px]">
              <img
                  :src="item.character.base64Image"
                  class="w-full h-full scale-125"
                  :alt="item.character.name"
              >
            </div>
            <!-- Имя + описание справа -->
            <div class="flex-1 min-w-0 pt-0.5 overflow-visible">
              <!-- Имя и джинксы в одну строку -->
              <div class="flex items-center gap-1 mb-0.5">
                <h3 class="text-xs font-medium leading-tight" :style="{ fontFamily: '\'Fira Sans Condensed\', sans-serif', color: getTeamColor(item.team) }">
                  {{ item.character.name }}
                </h3>
                <div v-if="item.character.jinxes" class="flex flex-nowrap relative top-[6.5px]">
                  <img
                      v-for="jinx in item.character.jinxes"
                      :key="jinx.id"
                      :src="jinx.base64Image"
                      class="w-6 h-6 inline-block align-top -ml-[5px] first:ml-0"
                      :alt="jinx.name"
                  />
                </div>
              </div>
              <!-- Описание -->
              <p class="text-xs leading-tight whitespace-pre-line" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
                {{ item.character.ability }}
              </p>
            </div>
          </div>
        </template>
      </div>
      <div v-else class="flex flex-col" :style="{ gap: roleGap + 'px' }">
        <template v-for="(item, itemIndex) in page.roles" :key="item.character.id">
          <!-- Заголовок команды -->
          <team-header v-if="item.showTeamHeader" :team="item.team" />
          <!-- Персонаж -->
          <div class="flex items-center space-x-4 -m-1.5 ml-1 p-0.3">
            <div class="w-10 h-10 ml-5">
              <img
                  :src="item.character.base64Image"
                  class="w-full h-full scale-135 mt-2"
                  :alt="item.character.name"
              >
            </div>
            <div class="w-[13%] -ml-2 mr-2 relative flex flex-col items-start h-auto flex-shrink-0 py-1">
              <h3 class="text-xs font-medium leading-tight block" :style="{ fontFamily: '\'Fira Sans Condensed\', sans-serif', color: getTeamColor(item.team) }">
                {{ item.character.name }}
              </h3>
              <div v-if="item.character.jinxes" class="absolute -left-1 top-full -mt-0.5 flex flex-nowrap overflow-visible z-0">
                <img
                    v-for="jinx in item.character.jinxes"
                    :key="jinx.id"
                    :src="jinx.base64Image"
                    class="w-6 h-6 inline-block align-top -ml-[5px] first:ml-0"
                    :alt="jinx.name"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0 mr-6">
              <p class="text-xs leading-tight whitespace-pre-line mr-4" style="color: rgb(0, 0, 0); font-family: 'Fira Sans Condensed', sans-serif;">
                {{ item.character.ability }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- Страницы ночного порядка (A4: 210x297mm) -->
    <div v-for="(nightPage, nightPageIndex) in nightOrderPages" :key="'night-' + nightPageIndex"
         class="pdf-page bg-white w-[210mm] h-[297mm] overflow-hidden relative">
      <!-- Заголовок на каждой странице -->
      <div class="flex items-end ml-10 mt-1 mb-4">
        <h1 class="text-2xl font-semibold uppercase" style="font-family: 'Philosopher', sans-serif;">{{ pdfMeta.name }}</h1>
        <div class="flex items-baseline ml-auto gap-2">
          <span class="mr-5" style="color: rgb(75, 85, 99);">by</span>
          <span class="text-lg first-letter:uppercase mr-25" style="font-family: 'Cormorant Garamond', serif; font-style: italic;">{{ pdfMeta.author }}</span>
        </div>
      </div>
      <!-- Нижний колонтитул с номером страницы -->
      <div v-if="pdfPrintDefaults.showPageNumbers" class="absolute bottom-4 left-0 right-0 flex items-center">
        <div class="h-[1px] ml-10 flex-1" style="background-color: rgb(139, 115, 85);"></div>
        <span class="mx-4 mb-6 text-base" style="color: rgb(100, 25, 32); font-family: 'Cormorant Garamond', serif;">{{ rolePages.length + nightPageIndex + 1 }}</span>
        <div class="h-[1px] mr-10 flex-1" style="background-color: rgb(139, 115, 85);"></div>
      </div>
      <div :class="['flex items-start', pdfPrintDefaults.showNightOrder && pdfPrintDefaults.nightOrderDisplayMode === 'compact' ? 'justify-between -mx-4' : '', !pdfPrintDefaults.showNightOrder ? 'justify-center' : '']">
        <night-order-table v-if="pdfPrintDefaults.showNightOrder"
                           class="w-[250px]"
                           :night="nightPage.firstNight"
                           title="First Night"
                           :display-mode="pdfPrintDefaults.nightOrderDisplayMode"
                           compact-shift="left" />
        <night-order-middle-table
            v-if="nightPage.showMiddleTable"
            class="w-[400px]"
            :jinxes="nightPage.jinxes"
            :djinn="djinn"
            :djinn-display-mode="pdfPrintDefaults.djinnDisplayMode"
            :bootlegger="bootlegger"
            :bootlegger-display-mode="pdfPrintDefaults.bootleggerDisplayMode"
            :bootlegger-rules="nightPage.showBootlegger ? pdfMeta.bootlegger : []"
            :tfl-display-mode="nightPage.showTFL ? pdfPrintDefaults.travellersFabledLoricDisplayMode : 'full'"
            :travellers-count="nightPage.showTFL ? tflData.travellersCount : 0"
            :first-traveller="nightPage.showTFL ? tflData.firstTraveller : null"
            :fabled-count="nightPage.showTFL ? tflData.fabledCount : 0"
            :first-fabled="nightPage.showTFL ? tflData.firstFabled : null"
            :loric-count="nightPage.showTFL ? tflData.loricCount : 0"
            :first-loric="nightPage.showTFL ? tflData.firstLoric : null" />
        <div v-else-if="pdfPrintDefaults.showNightOrder" class="w-[400px]" />
        <night-order-table v-if="pdfPrintDefaults.showNightOrder"
                           class="w-[250px]"
                           :night="nightPage.otherNight"
                           title="Other Nights"
                           :display-mode="pdfPrintDefaults.nightOrderDisplayMode"
                           compact-shift="right" />
      </div>
      <!-- Таблица игроков внизу страницы -->
      <player-count-table v-if="nightPage.showTable" class="absolute bottom-20 left-0 right-0" />
    </div>
    <!-- Дополнительные страницы с fabled, loric, bootlegger и таблицей -->
    <div v-for="(addPage, addPageIndex) in additionalPages" :key="'add-' + addPageIndex"
         class="pdf-page bg-white w-[210mm] h-[297mm] overflow-hidden relative">
      <!-- Заголовок -->
      <div class="flex items-end ml-10">
        <h1 class="text-2xl font-semibold uppercase" style="font-family: 'Philosopher', sans-serif;">{{ pdfMeta.name }}</h1>
        <div class="flex items-baseline ml-auto gap-2">
          <span class="mr-5" style="color: rgb(75, 85, 99);">by</span>
          <span class="text-lg first-letter:uppercase mr-25" style="font-family: 'Cormorant Garamond', serif; font-style: italic;">{{ pdfMeta.author }}</span>
        </div>
      </div>
      <!-- Нижний колонтитул с номером страницы -->
      <div v-if="pdfPrintDefaults.showPageNumbers" class="absolute bottom-4 left-0 right-0 flex items-center">
        <div class="h-[1px] ml-10 flex-1" style="background-color: rgb(139, 115, 85);"></div>
        <span class="mx-4 mb-6 text-base" style="color: rgb(100, 25, 32); font-family: 'Cormorant Garamond', serif;">{{ rolePages.length + nightOrderPages.length + addPageIndex + 1 }}</span>
        <div class="h-[1px] mr-10 flex-1" style="background-color: rgb(139, 115, 85);"></div>
      </div>
      <additional-info-page
          :travellers="addPage.travellers"
          :fabled="addPage.fabled"
          :loric="addPage.loric" />
      <!-- Таблица игроков внизу последней страницы -->
      <player-count-table v-if="addPage.isLastAdditionalPage" class="absolute bottom-20 left-0 right-0" />
    </div>
  </div>
  </div>
</template>
<script setup>
import {useCraftStore} from "@/store/craft";
import {useOptionsStore} from "@/store/options";
import {storeToRefs} from "pinia";
import {getImageFirstUrl} from "@/constants/other";
import {ref, watch, computed} from "vue";
import {getBase64Image} from "@/store";
import NightOrderTable from "@/components/craft/pdf/print/NightOrderTable.vue";
import NightOrderMiddleTable from "@/components/craft/pdf/print/NightOrderMiddleTable.vue";
import AdditionalInfoPage from "@/components/craft/pdf/print/AdditionalInfoPage.vue";
import TeamHeader from "@/components/craft/pdf/print/TeamHeader.vue";
import PlayerCountTable from "@/components/craft/pdf/print/PlayerCountTable.vue";
import {MAIN_ROLES} from "@/constants/roles";
const NIGHT_ROLES_PER_PAGE = 22
const JINXES_PER_PAGE = 12
const MAX_JINXES_WITH_BOOTLEGGER = 8 // Максимум джинксов на странице, чтобы поместился Bootlegger

const props = defineProps({
  scriptName: String,
  author: String,
  content: Object
})

const craftStore = useCraftStore()
const optionsStore = useOptionsStore()
const { pdfMeta, pdfListWithParams, pdfListElement } = storeToRefs(craftStore)
const { pdfPrintDefaults } = storeToRefs(optionsStore)
const items = ref({})
const pdfList = ref(null)
const jinxes = ref([])
const djinn = ref(null)
const bootlegger = ref(null)
// Computed для TFL
const tflData = computed(() => {
  const travellers = items.value['traveller'] || []
  const fabled = items.value['fabled'] || []
  const loric = items.value['loric'] || []
  return {
    travellersCount: travellers.length,
    firstTraveller: travellers[0] || null,
    fabledCount: fabled.length,
    firstFabled: fabled[0] || null,
    loricCount: loric.length,
    firstLoric: loric[0] || null
  }
})

// Эффективное количество ролей на страницу (учитывает количество колонок)
const effectiveRolesPerPage = computed(() => {
  const columns = pdfPrintDefaults.value.roleColumns
  if (columns === 2) {
    // При 2 колонках: rowsPerPage рядов, в каждом ряду 2 роли
    return pdfPrintDefaults.value.rowsPerPage * 2
  }
  return pdfPrintDefaults.value.rolesPerPage
})

// Computed для разбивки ролей на страницы
const rolePages = computed(() => {
  // Собираем все роли в плоский список в порядке MAIN_ROLES
  const allRoles = []
  for (const team of MAIN_ROLES) {
    const teamRoles = items.value[team] || []
    teamRoles.forEach(character => {
      allRoles.push({ team, character })
    })
  }

  if (allRoles.length === 0) {
    return [{ roles: [] }]
  }

  const columns = pdfPrintDefaults.value.roleColumns

  // Разбиваем на страницы
  const pages = []
  let currentPage = { roles: [] }
  let lastTeamOnPage = null

  if (columns === 2) {
    // Для 2 колонок: считаем РЯДЫ (headers + роли), не просто роли
    const maxRows = pdfPrintDefaults.value.rowsPerPage
    let currentRows = 0
    let cellsInRow = 0

    for (let i = 0; i < allRoles.length; i++) {
      const item = allRoles[i]
      const showTeamHeader = item.team !== lastTeamOnPage
      const needEmptyCell = showTeamHeader && cellsInRow === 1

      // Считаем сколько рядов РОЛЕЙ добавит этот элемент (headers не считаем в лимит)
      let rowsToAdd = 0
      if (needEmptyCell) rowsToAdd++ // Пустая ячейка завершает предыдущий ряд

      // Роль: если после header или needEmptyCell, начинаем новый ряд
      const newCellsInRow = (needEmptyCell || showTeamHeader) ? 1 : cellsInRow + 1
      if (newCellsInRow === 2) rowsToAdd++ // Завершаем ряд с 2 ролями

      // Проверяем ПЕРЕД добавлением, поместится ли
      const futureRows = currentRows + rowsToAdd
      const pendingRow = (newCellsInRow === 1) ? 1 : 0 // Неполный ряд в конце

      if (futureRows + pendingRow > maxRows && currentPage.roles.length > 0) {
        pages.push(currentPage)
        currentPage = { roles: [] }
        lastTeamOnPage = null
        currentRows = 0
        cellsInRow = 0
        // Пересчитываем для новой страницы
        i-- // Повторяем эту роль на новой странице
        continue
      }

      currentPage.roles.push({
        ...item,
        showTeamHeader: item.team !== lastTeamOnPage,
        needEmptyCell: (item.team !== lastTeamOnPage) && cellsInRow === 1
      })
      lastTeamOnPage = item.team
      currentRows = futureRows
      cellsInRow = (newCellsInRow === 2) ? 0 : newCellsInRow
    }
  } else {
    // Для 1 колонки: считаем роли
    const rolesPerPage = pdfPrintDefaults.value.rolesPerPage

    for (let i = 0; i < allRoles.length; i++) {
      const item = allRoles[i]
      const showTeamHeader = item.team !== lastTeamOnPage

      currentPage.roles.push({
        ...item,
        showTeamHeader
      })
      lastTeamOnPage = item.team

      if (currentPage.roles.length >= rolesPerPage && i < allRoles.length - 1) {
        pages.push(currentPage)
        currentPage = { roles: [] }
        lastTeamOnPage = null
      }
    }
  }

  // Добавляем последнюю страницу
  if (currentPage.roles.length > 0) {
    pages.push(currentPage)
  }

  return pages
})

// Computed для разбивки night order на страницы по 20 ролей
const nightOrderPages = computed(() => {
  const showNightOrder = pdfPrintDefaults.value.showNightOrder
  const showDjinn = pdfPrintDefaults.value.showDjinn
  const showBootlegger = pdfPrintDefaults.value.showBootlegger
  const showTFL = pdfPrintDefaults.value.showTravellersFabledLoric
  const tflDisplayMode = pdfPrintDefaults.value.travellersFabledLoricDisplayMode
  const hasTFLCompact = showTFL && tflDisplayMode === 'compact' && (tflData.value.travellersCount > 0 || tflData.value.fabledCount > 0 || tflData.value.loricCount > 0)

  // Если всё скрыто, возвращаем пустой массив
  if (!showNightOrder && !showDjinn && !showBootlegger && !hasTFLCompact) {
    return []
  }

  // Боковые таблицы показываются только если showNightOrder = true
  const firstNightRoles = showNightOrder ? getNightRoles('firstNight') : []
  const otherNightRoles = showNightOrder ? getNightRoles('otherNight') : []
  const allJinxes = showDjinn ? (jinxes.value || []) : []
  const bootleggerRules = showBootlegger ? (pdfMeta.value.bootlegger || []) : []

  // Определяем количество страниц для ролей (0 если скрыты)
  const nightRolePages = showNightOrder ? Math.max(
    Math.ceil(firstNightRoles.length / NIGHT_ROLES_PER_PAGE),
    Math.ceil(otherNightRoles.length / NIGHT_ROLES_PER_PAGE),
    1 // Минимум 1 страница если показываем
  ) : 0

  // Определяем количество страниц для джинксов
  // В compact режиме - все джинксы на одной странице (только header с бейджем)
  const djinnDisplayMode = pdfPrintDefaults.value.djinnDisplayMode
  const jinxPages = djinnDisplayMode === 'compact'
    ? (allJinxes.length > 0 ? 1 : 0)
    : Math.ceil(allJinxes.length / JINXES_PER_PAGE)

  // Общее количество страниц - максимум из ролей и джинксов
  const hasBootlegger = bootleggerRules.length > 0
  let maxPages = Math.max(nightRolePages, jinxPages)

  // Если есть только bootlegger или TFL compact без jinxes и nightOrder — минимум 1 страница
  if (maxPages === 0 && (hasBootlegger || hasTFLCompact)) {
    maxPages = 1
  }

  // Bootlegger на первой странице если djinn compact или нет jinxes, иначе на последней
  const djinnIsCompactOrEmpty = allJinxes.length === 0 || djinnDisplayMode === 'compact'

  // Если Bootlegger не помещается на последней странице — добавляем ещё одну
  // Но только если bootlegger должен быть на последней (т.е. djinn full с jinxes)
  const needsExtraPageForBootlegger = hasBootlegger && maxPages > 0 && !bootleggerFitsOnPage.value && !djinnIsCompactOrEmpty

  if (needsExtraPageForBootlegger) {
    maxPages += 1
  }

  // Сначала собираем все страницы с контентом
  const pages = []
  for (let i = 0; i < maxPages; i++) {
    const roleStartIdx = i * NIGHT_ROLES_PER_PAGE
    const roleEndIdx = roleStartIdx + NIGHT_ROLES_PER_PAGE
    const jinxStartIdx = i * JINXES_PER_PAGE
    const jinxEndIdx = jinxStartIdx + JINXES_PER_PAGE

    // В compact режиме все jinxes на первой странице, в full - разбиваем
    const pageJinxes = djinnDisplayMode === 'compact'
      ? (i === 0 ? allJinxes : [])
      : allJinxes.slice(jinxStartIdx, jinxEndIdx)
    const isLastPage = i === maxPages - 1
    const isFirstPage = i === 0

    // Показываем Bootlegger: на первой странице если нет jinxes или djinn в compact режиме, иначе на последней
    const showBootleggerOnPage = hasBootlegger && (djinnIsCompactOrEmpty ? isFirstPage : isLastPage)

    // TFL compact показывается на той же странице, что и bootlegger/djinn
    const showTFLOnPage = hasTFLCompact && (djinnIsCompactOrEmpty ? isFirstPage : isLastPage)

    // Контент страницы
    const pageFirstNight = firstNightRoles.slice(roleStartIdx, roleEndIdx)
    const pageOtherNight = otherNightRoles.slice(roleStartIdx, roleEndIdx)

    // Проверяем, есть ли контент на странице
    const hasNightRoles = showNightOrder && (pageFirstNight.length > 0 || pageOtherNight.length > 0)
    const hasMiddleContent = pageJinxes.length > 0 || showBootleggerOnPage || showTFLOnPage

    // Не добавляем пустую страницу
    if (!hasNightRoles && !hasMiddleContent) {
      continue
    }

    pages.push({
      firstNight: pageFirstNight,
      otherNight: pageOtherNight,
      jinxes: pageJinxes,
      showMiddleTable: hasMiddleContent,
      showBootlegger: showBootleggerOnPage,
      showTFL: showTFLOnPage,
      showTable: false // Установим позже для последней страницы
    })
  }

  // Устанавливаем таблицу на последней странице если помещается
  if (pages.length > 0 && canShowTableOnNightOrder.value) {
    pages[pages.length - 1].showTable = true
  }

  return pages
})

// Высота таблицы игроков (фиксированная)
const TABLE_HEIGHT = 200

// Определяем, можно ли показать таблицу на последней странице nightOrder
const canShowTableOnNightOrder = computed(() => {
  const showTable = pdfPrintDefaults.value.showTable
  const showTFL = pdfPrintDefaults.value.showTravellersFabledLoric
  const tflDisplayMode = pdfPrintDefaults.value.travellersFabledLoricDisplayMode

  // Таблица на nightOrder только если: showTable включен И (TFL выключен ИЛИ TFL в compact режиме)
  if (!showTable) return false
  if (showTFL && tflDisplayMode === 'full') return false

  // Проверяем, есть ли вообще контент для nightOrderPages
  const showNightOrder = pdfPrintDefaults.value.showNightOrder
  const showDjinn = pdfPrintDefaults.value.showDjinn
  const showBootlegger = pdfPrintDefaults.value.showBootlegger
  const hasTFLCompact = showTFL && tflDisplayMode === 'compact' && (tflData.value.travellersCount > 0 || tflData.value.fabledCount > 0 || tflData.value.loricCount > 0)

  // Если нет контента для nightOrderPages, таблица не может быть там
  if (!showNightOrder && !showDjinn && !showBootlegger && !hasTFLCompact) return false

  // Оценка высоты контента на ПОСЛЕДНЕЙ странице nightOrder
  const djinnDisplayMode = pdfPrintDefaults.value.djinnDisplayMode
  const nightOrderDisplayMode = pdfPrintDefaults.value.nightOrderDisplayMode

  // Считаем количество страниц nightOrder
  const firstNightRoles = showNightOrder ? getNightRoles('firstNight') : []
  const otherNightRoles = showNightOrder ? getNightRoles('otherNight') : []
  const allJinxes = showDjinn ? (jinxes.value || []) : []

  const nightRolePages = showNightOrder ? Math.max(
    Math.ceil(firstNightRoles.length / NIGHT_ROLES_PER_PAGE),
    Math.ceil(otherNightRoles.length / NIGHT_ROLES_PER_PAGE),
    1
  ) : 0
  const jinxPages = djinnDisplayMode === 'compact' ? (allJinxes.length > 0 ? 1 : 0) : Math.ceil(allJinxes.length / JINXES_PER_PAGE)
  const totalNightPages = Math.max(nightRolePages, jinxPages, 1)
  const isOnlyOnePage = totalNightPages === 1

  let middleContentHeight = 0

  // Определяем, где показывается TFL/Bootlegger (на первой или последней странице)
  const djinnIsCompactOrEmpty = allJinxes.length === 0 || djinnDisplayMode === 'compact'
  // TFL и Bootlegger на последней странице если djinn full с jinxes
  const tflOnLastPage = !djinnIsCompactOrEmpty

  if (isOnlyOnePage) {
    // Одна страница - весь контент здесь
    // Djinn
    if (showDjinn) {
      middleContentHeight += djinnDisplayMode === 'compact' ? 100 : 80 + allJinxes.length * 55
    }
    // Bootlegger
    if (showBootlegger) {
      const bootleggerRules = pdfMeta.value.bootlegger || []
      middleContentHeight += 80 + bootleggerRules.length * 25
    }
    // TFL compact
    if (hasTFLCompact) {
      const tflCount = (tflData.value.travellersCount > 0 ? 1 : 0) + (tflData.value.fabledCount > 0 ? 1 : 0) + (tflData.value.loricCount > 0 ? 1 : 0)
      middleContentHeight += tflCount * 90
    }
  } else if (tflOnLastPage) {
    // Несколько страниц, TFL и Bootlegger на последней — слишком много контента, таблица не поместится
    // Возвращаем false чтобы таблица пошла на отдельную страницу
    return false
  }
  // Если несколько страниц и TFL на первой - на последней только остатки jinxes (в full режиме)

  // Высота боковых таблиц на последней странице
  let sideTablesHeight = 0
  if (showNightOrder) {
    // Количество ролей на последней странице
    const firstNightOnLastPage = firstNightRoles.length % NIGHT_ROLES_PER_PAGE || (firstNightRoles.length > 0 && nightRolePages === 1 ? firstNightRoles.length : NIGHT_ROLES_PER_PAGE)
    const otherNightOnLastPage = otherNightRoles.length % NIGHT_ROLES_PER_PAGE || (otherNightRoles.length > 0 && nightRolePages === 1 ? otherNightRoles.length : NIGHT_ROLES_PER_PAGE)
    const maxRolesOnLastPage = Math.max(firstNightOnLastPage, otherNightOnLastPage)
    // Увеличил оценку высоты роли
    sideTablesHeight = nightOrderDisplayMode === 'compact' ? maxRolesOnLastPage * 35 : maxRolesOnLastPage * 45
  }

  // Добавляем высоту заголовка "First Night" / "Other Nights"
  const titleHeight = 40
  const contentHeight = Math.max(middleContentHeight, sideTablesHeight + titleHeight)
  const availableHeight = 850 // Реальная доступная высота для контента
  const tableBottomMargin = 50

  const totalRequired = contentHeight + TABLE_HEIGHT + tableBottomMargin
  const fits = totalRequired <= availableHeight

  return fits
})

// Определяем, поместится ли Bootlegger на первой/последней странице
const bootleggerFitsOnPage = computed(() => {
  const bootleggerRules = pdfMeta.value.bootlegger || []
  if (bootleggerRules.length === 0) return true // Нет правил — не нужно место

  const showDjinn = pdfPrintDefaults.value.showDjinn
  const djinnDisplayMode = pdfPrintDefaults.value.djinnDisplayMode
  const allJinxes = showDjinn ? (jinxes.value || []) : []

  // Примерная оценка высоты
  const estimatedBootleggerHeight = 60 + bootleggerRules.length * 20

  let estimatedDjinnHeight = 0
  if (showDjinn && allJinxes.length > 0) {
    if (djinnDisplayMode === 'compact') {
      // В compact режиме только header ~60px
      estimatedDjinnHeight = 60
    } else {
      // В full режиме: header + jinxes на последней странице
      const lastPageJinxesCount = allJinxes.length % JINXES_PER_PAGE || JINXES_PER_PAGE
      estimatedDjinnHeight = lastPageJinxesCount * 50 + 60
    }
  }

  const availableHeight = 550
  return (estimatedDjinnHeight + estimatedBootleggerHeight) <= availableHeight
})

// Константа для ролей на дополнительной странице
const ADDITIONAL_ROLES_PER_PAGE = 25

// Разбивка дополнительных ролей (travellers, fabled, loric) на страницы
const additionalPages = computed(() => {
  const showTFL = pdfPrintDefaults.value.showTravellersFabledLoric
  const tflDisplayMode = pdfPrintDefaults.value.travellersFabledLoricDisplayMode
  // В compact режиме TFL показываются в middle table, не на additional pages
  const showTFLOnAdditional = showTFL && tflDisplayMode === 'full'
  const travellers = showTFLOnAdditional ? (items.value['traveller'] || []) : []
  const fabled = showTFLOnAdditional ? (items.value['fabled'] || []) : []
  const loric = showTFLOnAdditional ? (items.value['loric'] || []) : []
  const bootleggerRules = pdfMeta.value.bootlegger || []
  const showTable = pdfPrintDefaults.value.showTable
  // Проверяем, показывается ли таблица уже на nightOrderPages
  const tableOnNightOrder = canShowTableOnNightOrder.value
  // Нужна ли таблица на additional pages
  const needTableHere = showTable && !tableOnNightOrder

  // Собираем все роли с их типом
  const allRoles = [
    ...travellers.map(r => ({ ...r, _type: 'traveller' })),
    ...fabled.map(r => ({ ...r, _type: 'fabled' })),
    ...loric.map(r => ({ ...r, _type: 'loric' }))
  ]

  // Максимум ролей на странице, где также есть таблица игроков
  const MAX_ROLES_WITH_TABLE = 15

  // Если нет ролей и таблица не нужна здесь, возвращаем пустой массив
  if (allRoles.length === 0 && !needTableHere) {
    return []
  }

  // Если нет ролей, но нужна таблица (и она не на nightOrder), показываем страницу с таблицей
  if (allRoles.length === 0) {
    return [{
      travellers: [],
      fabled: [],
      loric: [],
      bootleggerRules: bootleggerRules,
      isFirstAdditionalPage: true,
      isLastAdditionalPage: needTableHere
    }]
  }

  // Разбиваем на страницы по 25 ролей
  const pages = []
  for (let i = 0; i < allRoles.length; i += ADDITIONAL_ROLES_PER_PAGE) {
    const pageRoles = allRoles.slice(i, i + ADDITIONAL_ROLES_PER_PAGE)
    const isFirst = i === 0
    const isLastBatch = i + ADDITIONAL_ROLES_PER_PAGE >= allRoles.length

    // Проверяем, поместится ли таблица вместе с ролями на последней странице
    const canFitTableWithRoles = needTableHere && isLastBatch && pageRoles.length <= MAX_ROLES_WITH_TABLE

    pages.push({
      travellers: pageRoles.filter(r => r._type === 'traveller'),
      fabled: pageRoles.filter(r => r._type === 'fabled'),
      loric: pageRoles.filter(r => r._type === 'loric'),
      bootleggerRules: canFitTableWithRoles ? bootleggerRules : [],
      isFirstAdditionalPage: isFirst,
      isLastAdditionalPage: canFitTableWithRoles
    })
  }

  // Если таблица нужна здесь и не поместилась на последнюю страницу с ролями — добавляем отдельную страницу
  const lastPage = pages[pages.length - 1]
  if (needTableHere && !lastPage.isLastAdditionalPage) {
    pages.push({
      travellers: [],
      fabled: [],
      loric: [],
      bootleggerRules: bootleggerRules,
      isFirstAdditionalPage: false,
      isLastAdditionalPage: true
    })
  }

  // Фильтруем пустые страницы (без контента и без таблицы)
  const filteredPages = pages.filter(p =>
    p.travellers.length > 0 ||
    p.fabled.length > 0 ||
    p.loric.length > 0 ||
    p.isLastAdditionalPage
  )

  return filteredPages
})

watch(() => craftStore.shouldStartPrintPreparation, async (shouldStart) => {
  if (shouldStart) {
    try {
      items.value = await getListElements(pdfListWithParams.value)
      craftStore.markReadyToPrint()
    } catch (error) {
      craftStore.markPrintError(error)
    }
  }
})

async function getListElements(pdfListCopy){
  jinxes.value = []
  djinn.value = null

  // Загружаем Djinn (захардкожено, т.к. он обязателен при наличии джинксов)
  const djinnImageUrl = '/images/elements/pdf/icon_djinn.png'
  djinn.value = {
    id: 'djinn',
    name: 'Djinn',
    ability: 'Use the Djinn\'s special rule. All players know what it is.',
    base64Image: await getBase64Image(djinnImageUrl)
  }

  // Загружаем Bootlegger (захардкожено, т.к. он обязателен при наличии homebrew правил)
  const bootleggerImageUrl = '/images/elements/pdf/icon_bootlegger.png'
  bootlegger.value = {
    id: 'bootlegger',
    name: 'Bootlegger',
    ability: 'This script has homebrew rules. All players know what they are.',
    base64Image: await getBase64Image(bootleggerImageUrl)
  }

  // Сначала загружаем base64Image для всех персонажей
  const charactersWithImages = {}
  await Promise.all(
      Object.entries(pdfListCopy).map(async ([key, list]) => {
        charactersWithImages[key] = await Promise.all(
            list.map(async (el) => {
              const elCopy = { ...el }
              const imageUrl = getImageFirstUrl(el)
              elCopy.base64Image = await getBase64Image(imageUrl)

              if (!elCopy.base64Image || elCopy.base64Image.includes('default_character')) {
                console.warn(`⚠️ Image not loaded for ${el.name || el.id}: ${imageUrl}`)
              }

              return elCopy
            })
        )
      })
  )

  // Теперь обрабатываем джинксы, когда у всех персонажей уже есть base64Image
  for (const [key, list] of Object.entries(charactersWithImages)) {
    for (const character of list) {
      character.jinxes = await getValidJinxesForCharacter(character, charactersWithImages)
    }
  }

  return charactersWithImages
}

async function getValidJinxesForCharacter(character, charactersWithImages) {
  if (!character?.jinxes || !Array.isArray(character.jinxes)) return []

  // Все персонажи уже с base64Image
  const allRoles = Object.values(charactersWithImages)
      .flat()
      .filter(role => role?.id)

  const roleMap = Object.fromEntries(allRoles.map(role => [role.id, role]))

  const jinxesLocal = character.jinxes.map((jinx) => {
    const matched = roleMap[jinx.id]
    if (!matched) return null

    // Оба персонажа уже имеют base64Image
    addToJinxes(character, matched, jinx)

    return {
      id: jinx.id,
      reason: jinx.reason,
      base64Image: matched.base64Image || "",
      name: matched.name || "",
      ability: matched.ability || ""
    }
  })

  return jinxesLocal.filter(Boolean)
}

function addToJinxes(first, second, jinx){

  const isAlreadyAdded = jinxes.value.find(el =>
      el.first.id === second.id &&
      el.second.id === first.id)
  if(isAlreadyAdded) return

  jinxes.value.push({
    first: first,
    second: second,
    reason: jinx.reason
  })
}

// Вычисляет динамический отступ между ролями на основе настройки rolesPerPage (1 столбец)
const roleGap = computed(() => {
  const baseGap = 4 // Минимальный базовый отступ
  const availableHeight = 950 // Примерная высота страницы для ролей в px
  const roleHeight = 38 // Примерная высота одной роли в px
  const rolesPerPage = pdfPrintDefaults.value.rolesPerPage

  // При максимальном количестве ролей — только базовый отступ
  if (rolesPerPage >= 25) return baseGap

  // Вычисляем свободное пространство и распределяем между ролями
  const usedHeight = rolesPerPage * roleHeight
  const freeSpace = availableHeight - usedHeight
  const gaps = rolesPerPage > 1 ? rolesPerPage - 1 : 1

  return Math.max(baseGap, Math.floor(freeSpace / gaps))
})

// Вычисляет динамический отступ между рядами на основе настройки rowsPerPage (2 столбца)
// Логика идентична roleGap, но с параметрами для двухколоночного режима
const rowGap = computed(() => {
  const baseGap = 7 // Минимальный базовый отступ (уменьшен для выравнивания с 12 рядами)
  const maxRows = 13 // Максимальное количество рядов
  const rowHeight = 60 // Высота одного ряда в px
  // Общая высота рабочей области
  const availableHeight = 860
  const rowsPerPage = pdfPrintDefaults.value.rowsPerPage

  // При максимальном количестве рядов — только базовый отступ
  if (rowsPerPage >= maxRows) return baseGap

  // Вычисляем свободное пространство и распределяем между рядами
  const usedHeight = rowsPerPage * rowHeight
  const freeSpace = availableHeight - usedHeight
  const gaps = rowsPerPage > 1 ? rowsPerPage - 1 : 1

  return Math.max(baseGap, Math.floor(freeSpace / gaps))
})

function getNightRoles(field){
  const teamPriority = {
    demon: 0,
    minion: 1,
    outsider: 2,
    townsfolk: 3
  }

  const roles = Object.values(items.value)
      .flat()
      .filter(item => item[field] > 0)
      .sort((a, b) => {
        if (a[field] !== b[field]) {
          return a[field] - b[field]
        }

        return teamPriority[a.team] - teamPriority[b.team]
  })

  const duskObject = { id: 'pdf_dusk' }
  const dawnObject = { id: 'pdf_dawn' }

  if(field === 'otherNight') {
    return [duskObject, ...roles, dawnObject]
  }

  const result = []
  let minionInserted = false
  let demonInserted = false
  const minionObject = { id: 'pdf_minion_info' }
  const demonObject = { id: 'pdf_demon_info' }

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]
    if (!minionInserted && role[field] > 13.99) {
      result.push(minionObject)
      minionInserted = true
    }

    if (!demonInserted && role[field] > 18.01) {
      result.push(demonObject)
      demonInserted = true
    }

    result.push(role)
  }

  if (!minionInserted) {
    result.push(minionObject)
  }

  if (!demonInserted) {
    result.push(demonObject)
  }

  // Добавляем Dusk в начало и Dawn в конец
  return [duskObject, ...result, dawnObject]
}

function getTeamColor(team) {
  const blueTeams = ['townsfolk', 'outsider']
  const redTeams = ['minion', 'demon']
  if (blueTeams.includes(team)) return 'rgb(0, 100, 172)'
  if (redTeams.includes(team)) return 'rgb(118, 11, 13)'
  return 'inherit'
}

watch(pdfList, () => {
  pdfListElement.value = pdfList.value
}, {immediate:true})
</script>