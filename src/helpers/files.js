import fs from "node:fs";
import path from "node:path";
import {app} from "electron";
import https from "https";
import {access, mkdir, readdir, readFile, rename, rmdir, unlink, writeFile} from "fs/promises";

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

export const downloadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = [];
            resp.on('data', chunk => data.push(chunk));
            resp.on('end', () => {
                const buffer = Buffer.concat(data);
                const base64 = `data:${resp.headers['content-type']};base64,${buffer.toString('base64')}`;
                resolve(base64);
            });
        }).on('error', reject);
    });
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