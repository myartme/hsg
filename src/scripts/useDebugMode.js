import { ref, onMounted, onUnmounted } from 'vue'
import { useOptionsStore } from '@/store/options'
import { storeToRefs } from 'pinia'

// После Ctrl+Shift+D (Win/Linux) или Cmd+Shift+D (Mac) ожидаем 'e', 'b', 'u', 'g'
const DEBUG_SEQUENCE = ['e', 'b', 'u', 'g']
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

export function useDebugMode() {
    const optionsStore = useOptionsStore()
    const { debugMode } = storeToRefs(optionsStore)

    const isListening = ref(false)
    const currentIndex = ref(0)

    function handleKeyDown(event) {
        // Cmd+Shift+D (Mac) или Ctrl+Shift+D (Win/Linux) активирует режим прослушивания
        const modifierKey = isMac ? event.metaKey : event.ctrlKey
        if (modifierKey && event.shiftKey && event.key.toLowerCase() === 'd') {
            event.preventDefault()
            isListening.value = true
            currentIndex.value = 0
            return
        }

        // Если не в режиме прослушивания — игнорируем
        if (!isListening.value) return

        // Игнорируем модификаторы при вводе последовательности
        if (event.ctrlKey || event.altKey || event.metaKey) {
            resetListening()
            return
        }

        const expectedKey = DEBUG_SEQUENCE[currentIndex.value]
        const pressedKey = event.key.toLowerCase()

        if (pressedKey === expectedKey) {
            currentIndex.value++

            // Если ввели всю последовательность — переключаем debug mode
            if (currentIndex.value === DEBUG_SEQUENCE.length) {
                debugMode.value = !debugMode.value
                window.electronAPI?.toggleDevTools(debugMode.value)
                resetListening()
            }
        } else {
            // Неправильная буква — сбрасываем и прекращаем слушать
            resetListening()
        }
    }

    function resetListening() {
        isListening.value = false
        currentIndex.value = 0
    }

    onMounted(() => {
        document.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeyDown)
    })

    return {
        isListening,
        debugMode
    }
}
