import _ from 'lodash';
import {isEmpty} from "lodash/lang";

export const DEFAULT_ACTION_BUTTON_ACTIVE_TIME = 500;
export const DEFAULT_MIN_TIME = 10;
export const SET_INDEX = {
    DEFAULT: -3,
    IMPORT: -2,
    CREATE: -1
}

export const ZERO_VERSION = "0.0"
export const DEFAULT_VERSION = "1.0"

export const SORT = {
    DEFAULT: 'default',
    NAME: 'name',
    SCRIPT_QUEUE: 'scriptQueue',
    FIRST_NIGHT: 'firstNight',
    OTHER_NIGHT: 'otherNight',
    AUTHOR: 'author',
    DATE: 'date'
}

export const DEFAULT_ICONS = {
    townsfolk: "https://wiki.bloodontheclocktower.com/images/1/12/Generic_townsfolk.png",
    outsider: "https://wiki.bloodontheclocktower.com/images/5/53/Generic_outsider.png",
    minion: "https://wiki.bloodontheclocktower.com/images/b/bd/Generic_minion.png",
    demon: "https://wiki.bloodontheclocktower.com/images/5/52/Generic_demon.png",
    traveller: "https://wiki.bloodontheclocktower.com/images/0/07/Generic_traveller.png",
    fabled: "https://wiki.bloodontheclocktower.com/images/c/c9/Generic_fabled.png"
}

export const objectToPrettyJson = (data) => {
    return JSON.stringify(data, null, 2);
}

export const toNormalizeString = (value, limit = 0) => {
    if(isEmpty(value)) return ''

    const cyrillicToLatinMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh','щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    const transliterated = value
        .toLowerCase()
        .split('')
        .map(char => {
            return cyrillicToLatinMap[char] ?? char;
        })
        .join('')
        .replace(/[^a-z0-9_\s]/gi, '')
        .replace(/\s+/g, '_')
        .replace(/^_+|_+$/g, '');

    return limit > 0 ? transliterated.slice(0, limit) : transliterated;
}

export const getPluralTeam = (teamName) => {
    return teamName === 'townsfolk' ? teamName : teamName+"s"
}

export const getImageFirstUrl = (character, isOfficial = false) => {
    if(!character || !character.image) return
    if(isOfficial)
        return `images/icons/icon_${character.id}.png`

    if (Array.isArray(character.image)) {
        if (character.image.length > 0) {
            return character.image[0]
        }
    } else {
        return character.image;
    }
}

export const getImageArray = (data, team) => {
    let length = 2
    if(team === 'fabled'){
        length = 1
    }
    if(team === 'traveller'){
        length = 3
    }

    if (Array.isArray(data) && data?.length > 0) {
        return data.slice(0, length)
    }

    if (typeof data === 'string') {
        return [data, ...Array(length - 1).fill('')]
    }

    return [DEFAULT_ICONS[team] || "", ...Array(length - 1).fill('')]
}

export const isEqualWithDefault = (a, b) => {
    const isEmpty = (val) =>
        val === undefined || val === null ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === 'object' && true && Object.keys(val).length === 0)

    const customizer = (val1, val2) => {
        if (isEmpty(val1) && isEmpty(val2)) return true
        return undefined
    }

    const baseEqual = _.isEqualWith(a, b, customizer)
    if (baseEqual) return true

    const keys = _.union(_.keys(a), _.keys(b))
    for (const key of keys) {
        const valA = a[key]
        const valB = b[key]

        const bothEmpty = isEmpty(valA) && isEmpty(valB)
        const oneEmptyOtherMissing =
            (isEmpty(valA) && !(key in b)) ||
            (isEmpty(valB) && !(key in a))

        if (bothEmpty || oneEmptyOtherMissing) continue

        if (!_.isEqualWith(valA, valB, customizer)) return false
    }

    return true
}