import {ref, watch} from "vue";

export const isReadyToPrint = ref(false)
export const shouldStartPrintPreparation = ref(false)

export function triggerPrintPreparation() {
    isReadyToPrint.value = false
    shouldStartPrintPreparation.value = true
}

export function resetPrintPreparationTrigger() {
    shouldStartPrintPreparation.value = false
}

export function markReadyToPrint() {
    isReadyToPrint.value = true
}

export async function waitForReadyToPrint() {
    return new Promise((resolve) => {
        const stop = watch(isReadyToPrint, (ready) => {
            if (ready) {
                stop()
                resolve()
            }
        })
    })
}