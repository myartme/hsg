import fs from "node:fs";
import path from "node:path";
import {app} from "electron";
import https from "https";
import http from "http";
import {access, mkdir, readdir, readFile, rename, rmdir, stat, unlink, writeFile} from "fs/promises";
import crypto from "crypto";

export const getFilePath = (filename, directory) => {
    if (!fs.existsSync(directory)) fs.mkdirSync(directory)
    return path.join(directory, filename)
}

export const getCurrentFilePath = (filename, isAppPath) => {
    if(isAppPath){
        if (app.isPackaged) {
            return path.join(app.getAppPath(), '.vite', 'renderer', 'main_window', 'data', filename);
        } else {
            return path.join(app.getAppPath(), 'public', 'data', filename);
        }
    } else {
        return getFilePath(filename, path.join(app.getPath('userData'), 'data'))
    }
}

const isValidImage = (buffer) => {
    if (buffer.length < 4) return false

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 &&
        buffer[2] === 0x4E && buffer[3] === 0x47) return true

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true

    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 &&
        buffer[2] === 0x46 && buffer[3] === 0x38) return true

    // WebP: RIFF...WEBP
    if (buffer[0] === 0x52 && buffer[1] === 0x49 &&
        buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer.length > 11 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 &&
        buffer[10] === 0x42 && buffer[11] === 0x50) return true

    // SVG (текстовый формат)
    const str = buffer.toString('utf8', 0, Math.min(100, buffer.length))
    if (str.includes('<svg') || str.includes('<?xml')) return true

    return false
}

const getMimeType = (buffer) => {
    if (buffer[0] === 0x89) return 'image/png'
    if (buffer[0] === 0xFF) return 'image/jpeg'
    if (buffer[0] === 0x47) return 'image/gif'
    if (buffer[0] === 0x52) return 'image/webp'
    const str = buffer.toString('utf8', 0, Math.min(100, buffer.length))
    if (str.includes('<svg') || str.includes('<?xml')) return 'image/svg+xml'
    return 'image/png'
}

export const downloadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http

        protocol.get(url, (resp) => {
            // Проверяем HTTP статус
            if (resp.statusCode !== 200) {
                reject(new Error(`HTTP ${resp.statusCode}`))
                return
            }

            const expectedLength = parseInt(resp.headers['content-length'], 10)
            let data = []
            let receivedLength = 0

            resp.on('data', chunk => {
                data.push(chunk)
                receivedLength += chunk.length
            })

            resp.on('end', () => {
                const buffer = Buffer.concat(data)

                // Сравниваем размеры если Content-Length указан
                if (expectedLength && buffer.length !== expectedLength) {
                    reject(new Error(`Incomplete: got ${buffer.length} of ${expectedLength}`))
                    return
                }

                // Валидируем что это изображение
                if (!isValidImage(buffer)) {
                    reject(new Error('Invalid image format'))
                    return
                }

                const contentType = resp.headers['content-type'] || getMimeType(buffer)
                const base64 = `data:${contentType};base64,${buffer.toString('base64')}`
                resolve(base64)
            })
        }).on('error', reject)
    })
}

export const getFormat = (isJson) => isJson ? 'json' : 'pdf'

export const saveContent = async (filename, content, isAppPath, isJson = true) => {
    try {
        const filePath = getCurrentFilePath(`${filename}.${getFormat(isJson)}`, isAppPath)
        const dir = path.dirname(filePath)
        await mkdir(dir, { recursive: true })
        if(isJson){
            await writeFile(filePath, content, 'utf8')
        } else {
            await writeFile(filePath, content)
        }

        return {
            isSuccess: true,
            content: `Saved to: ${filePath}`
        }
    } catch (error) {
        return {
            isSuccess: false,
            error: {
                code: error.code,
                message: error.message,
                stack: error.stack
            }
        }
    }
}

export const loadContent = async (filename, isAppPath, isJson = true) => {
    try {
        const filePath = getCurrentFilePath(`${filename}.${getFormat(isJson)}`, isAppPath)
        const raw = isJson
            ? await readFile(filePath, 'utf8')
            : await readFile(filePath)
        return {
            isSuccess: true,
            content: isJson ? JSON.parse(raw) : raw.toString('base64')
        }
    } catch (error) {
        return {
            isSuccess: false,
            error: {
                code: error.code,
                message: error.message,
                stack: error.stack
            }
        }
    }
}

export const deleteContent = async (filename, isJson = true) => {
    try {
        const filePath = getCurrentFilePath(`${filename}.${getFormat(isJson)}`, false)
        const dirPath = path.dirname(filePath)
        await unlink(filePath)
        const remainingFiles = await readdir(dirPath)
        if (remainingFiles.length === 0) {
            await rmdir(dirPath)
        }
        return {
            isSuccess: true
        }
    } catch (err) {
        return {
            isSuccess: false,
            error: {
                code: err.code,
                message: err.message,
                stack: err.stack
            }
        }
    }
}

export const renameFile = async(oldFilename, newFilename, isAppPath) => {
    try {
        const oldFilePath = getCurrentFilePath(`${oldFilename}`, isAppPath)
        const newFilePath = getCurrentFilePath(`${newFilename}`, isAppPath)

        await access(oldFilePath);
        await rename(oldFilePath, newFilePath);

        return {
            isSuccess: true,
            content: `File ${oldFilePath} was renamed to ${newFilePath}`
        }
    } catch (err) {
        return {
            isSuccess: false,
            error: {
                code: err.code,
                message: err.message,
                stack: err.stack
            }
        }
    }
}

// ==================== Image Cache ====================

const getImageCacheDir = () => {
    return path.join(app.getPath('userData'), 'image-cache')
}

const urlToFilename = (url) => {
    const hash = crypto.createHash('md5').update(url).digest('hex')
    const ext = path.extname(new URL(url).pathname) || '.png'
    return `${hash}${ext}`
}

export const getCachedImage = async (url) => {
    try {
        const cacheDir = getImageCacheDir()
        const filename = urlToFilename(url)
        const filePath = path.join(cacheDir, filename)

        const data = await readFile(filePath, 'utf8')
        return { isSuccess: true, content: data }
    } catch (error) {
        return { isSuccess: false, error: error.code }
    }
}

export const saveCachedImage = async (url, base64Data) => {
    try {
        const cacheDir = getImageCacheDir()
        await mkdir(cacheDir, { recursive: true })

        const filename = urlToFilename(url)
        const filePath = path.join(cacheDir, filename)

        await writeFile(filePath, base64Data, 'utf8')
        return { isSuccess: true }
    } catch (error) {
        return { isSuccess: false, error: error.message }
    }
}

export const clearImageCache = async () => {
    try {
        const cacheDir = getImageCacheDir()
        const files = await readdir(cacheDir).catch(() => [])

        for (const file of files) {
            await unlink(path.join(cacheDir, file)).catch(() => {})
        }

        await rmdir(cacheDir).catch(() => {})
        return { isSuccess: true, deletedCount: files.length }
    } catch (error) {
        return { isSuccess: false, error: error.message }
    }
}

export const getImageCacheInfo = async () => {
    try {
        const cacheDir = getImageCacheDir()
        const files = await readdir(cacheDir).catch(() => [])

        let totalSize = 0
        for (const file of files) {
            const fileStat = await stat(path.join(cacheDir, file)).catch(() => null)
            if (fileStat) totalSize += fileStat.size
        }

        return {
            isSuccess: true,
            count: files.length,
            size: totalSize,
            sizeFormatted: formatBytes(totalSize)
        }
    } catch (error) {
        return { isSuccess: false, count: 0, size: 0, sizeFormatted: '0 B' }
    }
}

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}