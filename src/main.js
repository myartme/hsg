import { Menu, app, BrowserWindow, ipcMain, shell } from 'electron';
const https = require('https');
import path from 'node:path';
import fs from 'node:fs'
import { rm, mkdir, writeFile, readFile, unlink, readdir, rmdir, access, rename } from 'fs/promises';
import started from 'electron-squirrel-startup';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const getFilePath = (filename, directory) => {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory)
  return path.join(directory, filename)
}

const getCurrentFilePath = (filename, isAppPath) => {
  if(isAppPath){
    if (app.isPackaged) {
      return path.join(app.getAppPath(), '.vite', 'build', 'data', filename);
    } else {
      return path.join(app.getAppPath(), 'public', 'data', filename);
    }
  } else {
    return getFilePath(filename, path.join(app.getPath('userData'), 'data'))
  }
}

const downloadImageAsBase64 = (url) => {
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

const getFormat = (isJson) => isJson ? 'json' : 'pdf'

const saveContent = async (filename, content, isAppPath, isJson = true) => {
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

const loadContent = async (filename, isAppPath, isJson = true) => {
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

const deleteContent = async (filename, isJson = true) => {
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

const renameFile = async(oldFilename, newFilename, isAppPath) => {
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

ipcMain.handle("saveContentLibrary",
    async (e, { filename, folder, content, isAppPath })=> {
  return saveContent(path.join('library', folder, filename), content, isAppPath)
})

ipcMain.handle("loadContentLibrary",
    async (e, { filename, folder, isAppPath}) => {
  return loadContent(path.join('library', folder, filename), isAppPath)
})

ipcMain.handle("deleteContentLibrary",
    async (e, { filename, folder }) => {
  return deleteContent(path.join('library', folder, filename))
})


ipcMain.handle("saveContentScript",
    async (e, { filename, folder, content, isAppPath })=> {
  return saveContent(path.join('script', folder, filename), content, isAppPath)
})

ipcMain.handle("loadContentScript",
    async (e, { filename, folder, isAppPath}) => {
  return loadContent(path.join('script', folder, filename), isAppPath)
})

ipcMain.handle("deleteContentScript",
    async (e, { filename, folder }) => {
  return deleteContent(path.join('script', folder, filename))
})


ipcMain.handle("saveContentPrint",
    async (e, { filename, folder, content, isAppPath })=> {
  return saveContent(path.join('script', folder, filename), content, isAppPath, false)
})

ipcMain.handle("loadContentPrint",
    async (e, { filename, folder, isAppPath}) => {
  return loadContent(path.join('script', folder, filename), isAppPath, false)
})

ipcMain.handle("deleteContentPrint",
    async (e, { filename, folder }) => {
  return deleteContent(path.join('script', folder, filename), false)
})


ipcMain.handle("saveOptions",
    async (e, { content, isAppPath })=> {
  return saveContent('options', content, isAppPath)
})

ipcMain.handle("loadOptions",
    async (e, { isAppPath }) => {
  return loadContent('options', isAppPath)
})

ipcMain.handle("deleteOptions",
    async () => {
  return deleteContent('options')
})


ipcMain.handle('renameScriptFile', async (event, { oldFilename, newFilename, folder, isAppPath }) => {
  return renameFile(
      path.join('script', folder, oldFilename+'.json'),
      path.join('script', folder, newFilename+'.json'),
      isAppPath
  )
})
ipcMain.handle('renamePdfFile', async (event, { oldFilename, newFilename, folder, isAppPath }) => {
  return renameFile(
      path.join('script', folder, oldFilename+'.pdf'),
      path.join('script', folder, newFilename+'.pdf'),
      isAppPath
  )
})

ipcMain.handle('getBase64Image', async (event, imageUrl) => {
  return await downloadImageAsBase64(imageUrl);
})

ipcMain.handle('openLink', async (event, link) => {
  try{
    await shell.openExternal(link)
    return true
  } catch {}
  return false
})

ipcMain.handle('deleteAllData', async () => {
  try{
    await rm(getCurrentFilePath('', false), { recursive: true, force: true })
    return true
  } catch {}
  return false
})

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.maximize();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  const template = [];

  if (process.platform === 'darwin') {
    // macOS
    template.push(
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: () => {
                app.showAboutPanel();
              }
            },
            { type: 'separator' },
            { role: 'quit' }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' }
          ]
        },
        {
          label: 'View',
          submenu: [
            { role: 'reload' },
            { role: 'toggledevtools' },
            { role: 'togglefullscreen' }
          ]
        }
    );
  } else {
    template.push(
        {
          label: app.name,
          submenu: [
            { role: 'quit' }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' }
          ]
        },
        {
          label: 'View',
          submenu: [
            { role: 'reload' },
            { role: 'togglefullscreen' }
          ]
        },
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: () => mainWindow.webContents.send('show-about')
            }
          ]
        }
    )
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'BotC HSG',
      applicationVersion: '1.6.0',
      version: '1.6.0',
      copyright: '© 2025 Artem Chendey',
      iconPath: path.join(__dirname, 'icon.icns'),
      credits: 'This is an unofficial library of characters and scripts for the game Blood on the Clocktower.\n' +
          'The application uses images from the official website: http://bloodontheclocktower.com. All trademarks and assets belong to their respective owners.\n' +
          'This project is not affiliated with, endorsed by, or sponsored by the creators of Blood on the Clocktower.'
    });
  }
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
