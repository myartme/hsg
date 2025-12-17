import { Menu, app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { rm } from 'fs/promises';
import started from 'electron-squirrel-startup';
import { saveContent, loadContent, deleteContent, renameFile , getCurrentFilePath, downloadImageAsBase64 } from '/src/helpers/files.js'

const menuLabels = {
  en: {
    about: 'About',
    quit: 'Quit',
    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    view: 'View',
    reload: 'Reload',
    toggleDevTools: 'Toggle Developer Tools',
    toggleFullscreen: 'Toggle Fullscreen',
    help: 'Help'
  },
  ru: {
    about: 'О программе',
    quit: 'Выход',
    edit: 'Редактирование',
    undo: 'Отменить',
    redo: 'Повторить',
    cut: 'Вырезать',
    copy: 'Копировать',
    paste: 'Вставить',
    selectAll: 'Выделить всё',
    view: 'Вид',
    reload: 'Перезагрузить',
    toggleDevTools: 'Инструменты разработчика',
    toggleFullscreen: 'Полноэкранный режим',
    help: 'Справка'
  }
}

const aboutCredits = {
  en: 'This is an unofficial library of characters and scripts for the game Blood on the Clocktower.\n' +
      'The application uses images from the official website: http://bloodontheclocktower.com. All trademarks and assets belong to their respective owners.\n' +
      'This project is not affiliated with, endorsed by, or sponsored by the creators of Blood on the Clocktower.',
  ru: 'Это неофициальная библиотека персонажей и скриптов для игры Blood on the Clocktower.\n' +
      'Приложение использует изображения с официального сайта: http://bloodontheclocktower.com. Все торговые марки и материалы принадлежат их владельцам.\n' +
      'Этот проект не связан с создателями Blood on the Clocktower и не одобрен ими.'
}

let currentLanguage = 'en'
let mainWindow = null
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
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

ipcMain.handle('setLanguage', async (event, lang) => {
  currentLanguage = lang
  if (mainWindow) {
    buildMenu()
    updateAboutPanel()
  }
  return true
})

function updateAboutPanel() {
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'BotC HSG',
      applicationVersion: '1.7.0',
      version: '1.7.0',
      copyright: '© 2025 Artem Chendey',
      iconPath: path.join(__dirname, 'icon.icns'),
      credits: aboutCredits[currentLanguage] || aboutCredits.en
    })
  }
}

function buildMenu() {
  const labels = menuLabels[currentLanguage] || menuLabels.en
  const template = []

  if (process.platform === 'darwin') {
    // macOS
    template.push(
        {
          label: app.name,
          submenu: [
            {
              label: labels.about,
              click: () => {
                app.showAboutPanel()
              }
            },
            { type: 'separator' },
            { role: 'quit', label: labels.quit }
          ]
        },
        {
          label: labels.edit,
          submenu: [
            { role: 'undo', label: labels.undo },
            { role: 'redo', label: labels.redo },
            { type: 'separator' },
            { role: 'cut', label: labels.cut },
            { role: 'copy', label: labels.copy },
            { role: 'paste', label: labels.paste },
            { role: 'selectAll', label: labels.selectAll }
          ]
        },
        {
          label: labels.view,
          submenu: [
            { role: 'reload', label: labels.reload },
            { role: 'toggledevtools', label: labels.toggleDevTools },
            { role: 'togglefullscreen', label: labels.toggleFullscreen }
          ]
        }
    )
  } else {
    template.push(
        {
          label: app.name,
          submenu: [
            { role: 'quit', label: labels.quit }
          ]
        },
        {
          label: labels.edit,
          submenu: [
            { role: 'undo', label: labels.undo },
            { role: 'redo', label: labels.redo },
            { type: 'separator' },
            { role: 'cut', label: labels.cut },
            { role: 'copy', label: labels.copy },
            { role: 'paste', label: labels.paste },
            { role: 'selectAll', label: labels.selectAll }
          ]
        },
        {
          label: labels.view,
          submenu: [
            { role: 'reload', label: labels.reload },
            { role: 'togglefullscreen', label: labels.toggleFullscreen }
          ]
        },
        {
          label: labels.help,
          submenu: [
            {
              label: labels.about,
              click: () => mainWindow.webContents.send('show-about', currentLanguage)
            }
          ]
        }
    )
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
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

  buildMenu();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  updateAboutPanel()
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
