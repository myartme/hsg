// Cloud data configuration
export const CLOUD_CONFIG = {
    baseUrl: 'https://botc-hsg-admin-eff35.web.app',
    libraryPath: '/data/library'
}

// Build full URL for cloud resource
export function getCloudUrl(filename, folder = '') {
    const path = folder
        ? `${CLOUD_CONFIG.libraryPath}/${folder}/${filename}.json`
        : `${CLOUD_CONFIG.libraryPath}/${filename}.json`
    return `${CLOUD_CONFIG.baseUrl}${path}`
}
