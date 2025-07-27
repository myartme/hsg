export const MAIN_ROLES = ['townsfolk', 'outsider', 'minion', 'demon'];
export const ROLES = [...MAIN_ROLES, 'traveller', 'fabled'];

export const EMPTY_SET = {
    "id": "",
    "author": "",
    "name": "",
    "logo": "",
    "isOfficial": false
}

export const EMPTY_SCRIPT = {
    "author": "",
    "name": ""
}

export const DEFAULT_SCRIPT_NAME = 'Script name'
export const DEFAULT_SCRIPT_AUTHOR = 'Unknown'

export const EMPTY_IMPORT_SCRIPT = {
    "author": "",
    "name": "",
    "logo": "",
    "background": "",
    "hideTitle": false,
    "almanac": ""
}

export const EMPTY_CHARACTER = {
    "id": "",
    "edition": "",
    "name": "",
    "team": "",
    "ability": "",
    "image": ["", "", ""],
    "firstNight": 0,
    "firstNightReminder": "",
    "otherNight": 0,
    "otherNightReminder": "",
    "flavor": "",
    "reminders": [],
    "remindersGlobal": [],
    "jinxes": []
}

export function stripDefaults(obj, defaults) {
    const result = {}

    for (const key in obj) {
        const val = obj[key]
        const defVal = defaults[key]

        if (Array.isArray(val) && Array.isArray(defVal)) {
            if (JSON.stringify(val) !== JSON.stringify(defVal)) {
                result[key] = val
            }
        }

        else if (val && typeof val === 'object' && defVal && typeof defVal === 'object') {
            const cleaned = stripDefaults(val, defVal)
            if (Object.keys(cleaned).length > 0) {
                result[key] = cleaned
            }
        }

        else if (val !== defVal) {
            result[key] = val
        }
    }

    return result
}