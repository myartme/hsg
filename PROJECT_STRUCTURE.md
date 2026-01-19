# BotC HSG — Документация проекта

**Blood on the Clocktower Homebrew Script Generator**
**Версия:** 1.8.0

## Назначение

Десктопное приложение для создания и управления библиотекой персонажей и скриптов для настольной игры "Blood on the Clocktower". Позволяет создавать собственные наборы персонажей, генерировать PDF-документы и экспортировать/импортировать данные.

---

## Технологический стек

| Категория | Технология |
|-----------|------------|
| Фреймворк | Vue 3.5 (Composition API) |
| Десктоп | Electron 36.2 + Electron Forge |
| Состояние | Pinia 3.0 |
| Роутинг | Vue Router 4.6 |
| Сборка | Vite 5.4 |
| Стили | Tailwind CSS 4.1 |
| UI библиотеки | floating-vue, vuedraggable, vue-color, json-editor-vue |

---

## Структура директорий

```
src/
├── main.js              # Главный процесс Electron (IPC handlers)
├── preload.js           # Preload-скрипт (мост между main и renderer)
├── renderer.js          # Точка входа Vue-приложения
├── index.css            # Глобальные стили и темы
│
├── components/          # Vue компоненты (74 файла)
│   ├── layouts/         # Макеты
│   │   ├── AppLayout.vue    # Главная обёртка с темой
│   │   └── AppMenu.vue      # Навигация
│   │
│   ├── craft/           # Создание скриптов (25 файлов)
│   │   ├── pdf/         # PDF компоненты
│   │   │   ├── preview/ # Предпросмотр
│   │   │   └── print/   # Генерация PDF
│   │   ├── list/        # Списки персонажей
│   │   └── scripts/     # Редактор скриптов
│   │
│   ├── library/         # Библиотека персонажей (22 файла)
│   │   ├── Roles/       # Отображение ролей
│   │   ├── RoleEditor/  # Редактор персонажей
│   │   └── Sets/        # Управление наборами
│   │
│   ├── options/         # Настройки (3 файла)
│   │   ├── ExportLibrary.vue
│   │   ├── ImportLibrary.vue
│   │   └── ExportStep.vue
│   │
│   └── ui/              # Переиспользуемые UI компоненты (20 файлов)
│       ├── ActionButton.vue
│       ├── SimpleInput.vue
│       ├── SimpleDropdown.vue
│       ├── CustomButton.vue
│       ├── Toggle.vue
│       ├── Slider.vue
│       └── ...
│
├── pages/               # Страницы приложения
│   ├── Scripts.vue          # Список скриптов
│   ├── CharacterLibrary.vue # Библиотека персонажей
│   ├── EditScript.vue       # Редактор скрипта
│   └── Options.vue          # Настройки
│
├── store/               # Pinia хранилища
│   ├── index.js         # Корневой store (блокировка окна)
│   │
│   ├── library/         # Библиотека персонажей
│   │   ├── index.js     # Главный store
│   │   ├── state.js     # Состояние (refs + computed)
│   │   ├── set.js       # CRUD наборов
│   │   ├── character.js # CRUD персонажей
│   │   ├── queue.js     # Очередь ночи
│   │   ├── bootlegger.js
│   │   └── night_order.js
│   │
│   ├── craft/           # Создание скриптов
│   │   ├── index.js     # Главный store
│   │   ├── state.js     # Состояние
│   │   ├── script.js    # Операции со скриптами
│   │   ├── pdf.js       # PDF списки
│   │   ├── print.js     # Подготовка печати
│   │   └── set.js       # Загрузка наборов
│   │
│   └── options/         # Настройки
│       ├── index.js     # Import/Export
│       └── state.js     # Тема и опции
│
├── router/
│   └── index.js         # Маршруты приложения
│
├── helpers/
│   └── files.js         # Файловые операции (IPC)
│
├── constants/
│   ├── other.js         # Общие константы
│   └── roles.js         # Определения ролей
│
└── scripts/
    └── v-click-outside.js  # Директива клика вне элемента
```

---

## Маршрутизация

| Путь | Имя | Компонент | Описание |
|------|-----|-----------|----------|
| `/` | — | redirect → scriptList | Редирект на список скриптов |
| `/scripts` | scriptList | Scripts.vue | Список скриптов |
| `/library` | library | CharacterLibrary.vue | Библиотека персонажей |
| `/edit-scripts` | scriptEdit | EditScript.vue | Редактор скрипта |
| `/options` | options | Options.vue | Настройки |

---

## Хранилища (Stores)

### useIndexStore (корневой)
- `isLocked` — блокировка окна для модалок
- `lockedSource` — источник блокировки
- `focusWindow()` / `unfocusWindow()`

### useLibraryStore (библиотека)
**Состояние:**
- `allData` — все наборы с метаданными и персонажами
- `activeSetIndex` — текущий набор
- `activeCharacter` — редактируемый персонаж
- `queuePositions` — позиции ночной очереди
- `bootlegger` — данные роли Bootlegger
- `nightOrder` — порядок ночи

**Методы:**
- `loadSets()` / `saveSet()` / `saveSets()` — CRUD наборов
- `saveNewMetaAndList()` — создание набора
- `deleteSet()` / `restoreSet()` — удаление/восстановление
- `saveActiveCharacter()` — сохранение персонажа

### useCraftStore (скрипты)
**Состояние:**
- `scriptList` — список скриптов
- `activeScript` — текущий скрипт
- `pdfListWithParams` — персонажи для PDF
- `pdfMeta` — метаданные скрипта
- `tags` — теги скриптов

**Методы:**
- `loadScripts()` / `loadScript()` / `saveCurrentScript()`
- `deleteScript()` / `deleteScripts()`
- `savePdf()` / `loadPdf()` / `deletePdf()`
- `triggerPrintPreparation()` / `markReadyToPrint()`

### useOptionsStore (настройки)
**Состояние:**
- `debugMode` — режим отладки
- `theme` — тема (light/dark)
- `appVersion` — версия приложения

**Методы:**
- `getOptions()` / `setOptions()`
- `importSets()` / `importScripts()` / `exportData()`
- `deleteAppData()`

---

## Структуры данных

### Набор персонажей (Set)
```javascript
{
  meta: {
    id: "set-id",
    author: "Автор",
    name: "Название набора",
    logo: "url-картинки",
    isOfficial: boolean
  },
  list: {
    townsfolk: [],   // Горожане
    outsider: [],    // Аутсайдеры
    minion: [],      // Приспешники
    demon: [],       // Демоны
    traveller: [],   // Путешественники
    fabled: [],      // Легенды
    loric: []        // Лорики
  }
}
```

### Персонаж (Character)
```javascript
{
  id: "unique-id",
  edition: "set-id",
  name: "Имя",
  team: "townsfolk|outsider|minion|demon|traveller|fabled",
  ability: "Способность персонажа",
  image: ["url1", "url2"],
  firstNight: number,      // Порядок первой ночи
  otherNight: number,      // Порядок остальных ночей
  reminders: ["напоминание"],
  remindersGlobal: ["глобальное напоминание"],
  jinxes: [{ id, reason }],
  specials: [{ title, description }]
}
```

### Скрипт (Script)
```javascript
{
  name: "Название скрипта",
  author: "Автор",
  version: "1.0",
  date: "ISO дата",
  list: [
    {
      version: "1.0",
      note: "Примечания к версии"
    }
  ]
}
```

---

## IPC каналы (Electron)

### Библиотека
- `saveContentLibrary` / `loadContentLibrary` / `deleteContentLibrary`

### Скрипты
- `saveContentScript` / `loadContentScript` / `deleteContentScript`

### PDF/Печать
- `saveContentPrint` / `loadContentPrint` / `deleteContentPrint`

### Настройки
- `saveOptions` / `loadOptions` / `deleteOptions`

### Утилиты
- `renameScriptFile` / `renamePdfFile`
- `getBase64Image`
- `openLink`
- `deleteAllData`

---

## Ключевые компоненты

### Layouts
- **AppLayout.vue** — обёртка приложения с применением темы
- **AppMenu.vue** — навигационное меню

### Craft (создание скриптов)
- **List.vue** — список скриптов с фильтрацией
- **ScriptOptionsPopup.vue** — редактор метаданных скрипта
- **ButtonPanel.vue** — панель действий для PDF
- **PreviewPdf.vue** — предпросмотр PDF
- **NightOrderElement.vue** — управление порядком ночи

### Library (библиотека)
- **RolesInScript.vue** — отображение персонажей в наборе
- **EditForm.vue** — редактор персонажа
- **EditSet.vue** — редактор набора
- **SetList.vue** — список наборов
- **QueuePositions.vue** — позиции очереди ночи

### UI (переиспользуемые)
- **SimpleInput.vue** — текстовое поле
- **SimpleDropdown.vue** — выпадающий список
- **ActionButton.vue** — кнопка действия
- **Toggle.vue** — переключатель
- **PopupContainer.vue** — обёртка модального окна
- **SectorContainer.vue** — секция с прилипающими действиями

---

## Команды

```bash
npm start        # Запуск в режиме разработки
npm run package  # Сборка пакета
npm run make     # Создание установщика
npm run publish  # Публикация
```

---

## Темизация

Приложение поддерживает светлую и тёмную темы через CSS-переменные в `src/index.css`:
- Переключение через `useOptionsStore.theme`
- Классы `.light` / `.dark` применяются к корневому элементу
- Цветовые переменные: фон, текст, кнопки, границы, активные состояния

---

## Статистика проекта

| Метрика | Значение |
|---------|----------|
| Vue компоненты | 74 файла |
| Код компонентов | ~8,855 строк |
| JS файлы (stores/helpers) | 24 файла |
| Экспорты из stores | 114 функций |
| Страницы | 4 |
| UI компоненты | 20 |
