import {ref, watch} from "vue";
import {pdfGenerationError} from "@/store/craft/state";

export const isReadyToPrint = ref(false)
export const shouldStartPrintPreparation = ref(false)

export function triggerPrintPreparation() {
    isReadyToPrint.value = false
    pdfGenerationError.value = null
    shouldStartPrintPreparation.value = true
}

export function resetPrintPreparationTrigger() {
    shouldStartPrintPreparation.value = false
}

export function markReadyToPrint() {
    isReadyToPrint.value = true
}

export function markPrintError(error) {
    pdfGenerationError.value = error
}

export async function waitForReadyToPrint() {
    return new Promise((resolve, reject) => {
        const stopReady = watch(isReadyToPrint, (ready) => {
            if (ready) {
                stopReady()
                stopError()
                resolve()
            }
        })
        const stopError = watch(pdfGenerationError, (error) => {
            if (error) {
                stopReady()
                stopError()
                reject(error)
            }
        })
    })
}