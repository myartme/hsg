// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld(
    'electronAPI',
    {
        writeToLibraryJson: (filename, folder, content, isAppPath) => {
            return ipcRenderer.invoke('saveContentLibrary', { filename, folder, content, isAppPath })
        },
        readFromLibraryJson: (filename, folder, isAppPath) => {
            return ipcRenderer.invoke('loadContentLibrary', { filename, folder, isAppPath })
        },
        deleteLibraryJson: (filename, folder) => {
            return ipcRenderer.invoke('deleteContentLibrary', { filename, folder })
        },


        writeToScriptJson: (filename, folder, content, isAppPath) => {
            return ipcRenderer.invoke('saveContentScript', { filename, folder, content, isAppPath })
        },
        readFromScriptJson: (filename, folder, isAppPath) => {
            return ipcRenderer.invoke('loadContentScript', { filename, folder, isAppPath })
        },
        deleteScriptJson: (filename, folder) => {
            return ipcRenderer.invoke('deleteContentScript', { filename, folder })
        },


        writeToScriptPdf: (filename, folder, content, isAppPath) => {
            return ipcRenderer.invoke('saveContentPrint', { filename, folder, content, isAppPath })
        },
        readFromScriptPdf: (filename, folder, isAppPath) => {
            return ipcRenderer.invoke('loadContentPrint', { filename, folder, isAppPath })
        },
        deleteScriptPdf: (filename, folder) => {
            return ipcRenderer.invoke('deleteContentPrint', { filename, folder })
        },

        writeToOptions: (content, isAppPath) => {
            return ipcRenderer.invoke('saveOptions', { content, isAppPath })
        },
        readFromOptions: (isAppPath) => {
            return ipcRenderer.invoke('loadOptions', { isAppPath })
        },
        deleteOptions: () => {
            return ipcRenderer.invoke('deleteOptions')
        },


        renameScriptFile: (oldFilename, newFilename, folder, isAppPath) => {
            return ipcRenderer.invoke('renameScriptFile', { oldFilename, newFilename, folder, isAppPath })
        },
        renamePdfFile: (oldFilename, newFilename, folder, isAppPath) => {
            return ipcRenderer.invoke('renamePdfFile', { oldFilename, newFilename, folder, isAppPath })
        },

        getBase64Image: (url) =>
            ipcRenderer.invoke('getBase64Image', url),

        getLocalImage: (relativePath) =>
            ipcRenderer.invoke('getLocalImage', relativePath),

        getCachedImage: (url) =>
            ipcRenderer.invoke('getCachedImage', url),

        saveCachedImage: (url, base64Data) =>
            ipcRenderer.invoke('saveCachedImage', { url, base64Data }),

        clearImageCache: () =>
            ipcRenderer.invoke('clearImageCache'),

        getImageCacheInfo: () =>
            ipcRenderer.invoke('getImageCacheInfo'),

        openLink: (url) => {
            return ipcRenderer.invoke('openLink', url)
        },

        deleteAllData: () => {
            return ipcRenderer.invoke('deleteAllData')
        },

        setLanguage: (lang) => {
            return ipcRenderer.invoke('setLanguage', lang)
        },

        toggleDevTools: (isOpen) => {
            return ipcRenderer.invoke('toggleDevTools', isOpen)
        },

        // Draft (session) operations
        saveDraft: (content) => {
            return ipcRenderer.invoke('saveDraft', { content })
        },
        loadDraft: () => {
            return ipcRenderer.invoke('loadDraft')
        },
        deleteDraft: () => {
            return ipcRenderer.invoke('deleteDraft')
        },

        // Cloud data loading
        loadFromCloud: (url) => {
            return ipcRenderer.invoke('loadFromCloud', { url })
        }
    }
)
const aboutTexts = {
    en: {
        version: 'Version',
        description: 'This is an unofficial library of characters and scripts for the game Blood on the Clocktower.',
        images: 'The application uses images from the official website: http://bloodontheclocktower.com.',
        trademarks: 'All trademarks and assets belong to their respective owners.',
        disclaimer: 'This project is not affiliated with, endorsed by, or sponsored by the creators of Blood on the Clocktower.',
        contact: 'Contact the author',
        close: 'Close'
    },
    ru: {
        version: 'Версия',
        description: 'Это неофициальная библиотека персонажей и скриптов для игры Blood on the Clocktower.',
        images: 'Приложение использует изображения с официального сайта: http://bloodontheclocktower.com.',
        trademarks: 'Все торговые марки и материалы принадлежат их владельцам.',
        disclaimer: 'Этот проект не связан с создателями Blood on the Clocktower и не одобрен ими.',
        contact: 'Связаться с автором',
        close: 'Закрыть'
    }
}

ipcRenderer.on('show-about', (event, lang = 'en') => {
    if (document.getElementById('about-modal')) return

    const t = aboutTexts[lang] || aboutTexts.en
    const modal = document.createElement('div')
    modal.id = 'about-modal';
    modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;">
        <div style="
        background: #1f1f1f;
        padding: 24px;
        border-radius: 12px;
        max-width: 400px;
        text-align: center;
        font-family: sans-serif;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
          <h2 style="margin-bottom: 8px; color:white">BotC HSG</h2>
          <p style="margin-bottom: 16px; color:white">${t.version} 1.8.0</p>
          <p style="margin-bottom: 16px; font-size: 14px; color: #9a9797;">
            ${t.description}
            <br>${t.images}
            <br>${t.trademarks}
            <br>${t.disclaimer}
          </p>
          <p style="margin-bottom: 24px; font-size: 14px; color: #9a9797;">
            ${t.contact}:
            <a href="mailto:myartme@gmail.com" style="color: #a78bfa; text-decoration: none;">myartme@gmail.com</a>
            &nbsp;|&nbsp;
            <a href="https://t.me/Myartme" style="color: #a78bfa; text-decoration: none;">Telegram</a>
          </p>
          <button id="about-close" style="
          padding: 8px 16px;
          background-color: rgba(88,46,136,0.8);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;">${t.close}</button>
        </div>
    </div>
  `;
    document.body.appendChild(modal);

    document.getElementById('about-close')?.addEventListener('click', () => {
        modal.remove();
    });
});