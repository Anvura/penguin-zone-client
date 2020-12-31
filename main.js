const {
    app,
    dialog,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain,
    nativeTheme
} = require('electron')

const DiscordRPC = require('discord-rpc');
let rpc

const {
    autoUpdater
} = require('electron-updater');

const path = require('path')


let pluginName
switch (process.platform) {
case 'win32':
    switch (process.arch) {
    case 'ia32':
        pluginName = 'flash/pepflashplayer32_32_0_0_303.dll'
        break
    case 'x32':
        pluginName = 'flash/pepflashplayer32_32_0_0_303.dll'
        break
    case 'x64':
        pluginName = 'flash/pepflashplayer64_32_0_0_303.dll'
        break
    }
    break
case 'darwin':
    pluginName = 'flash/PepperFlashPlayer.plugin'
    break
case 'linux':
    pluginName = 'flash/libpepflashplayer.so'
    break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

var win
app.on('ready', () => {
    createWindow();
})

//window creation function
function createWindow() {
    win = new BrowserWindow
    ({
        title: "Snowy Fields DLC",
        webPreferences: {
            plugins: true,
            nodeIntegration: true
        },
        width: 1385,
        height: 840
    });
    makeMenu();
    activateRPC();
	
    win.loadFile('index.html');
    autoUpdater.checkForUpdatesAndNotify();
    Menu.setApplicationMenu(fsmenu);
	
    mainWindow.on('closed', () => {
    	mainWindow = null;
    });
}

// start of menubar part

const aboutMessage = `Snowy Fields Client v${app.getVersion()}\nCreated by Random with much code provided by Allinol for use with Coastal Freeze.`;


function activateRPC() { 
  const clientId = '794276213144944681'; 
  DiscordRPC.register(clientId);
  rpc = new DiscordRPC.Client({ transport: 'ipc' }); 
  const startTimestamp = new Date();
  rpc.on('ready', () => {
    rpc.setActivity({
      details: `www.snowyfields.ca`, 
      startTimestamp, 
      largeImageKey: `main-logo`
    });
  });
  rpc.login({ clientId }).catch();
}

function makeMenu() { // credits to random
    fsmenu = new Menu();
    if (process.platform == 'darwin') {
        fsmenu.append(new MenuItem({
            label: "Snowy Fields DLC",
            submenu: [{
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: "info",
                            buttons: ["Ok"],
                            title: "About Snowy Fields DLC",
                            message: aboutMessage
                        });
                    }
                },
                {
                    label: 'Fullscreen (Toggle)',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        win.setFullScreen(!win.isFullScreen());
                        win.webContents.send('fullscreen', win.isFullScreen());
                    }
                },
                {
                    label: 'Mute Audio (Toggle)',
                    click: () => {
                        win.webContents.audioMuted = !win.webContents.audioMuted;
                        win.webContents.send('muted', win.webContents.audioMuted);
                    }
                },
                {
                    label: 'Log Out',
                    click: () => {
                        clearCache();
                        win.loadFile('index.html');
                    }
                }
            ]
        }));
    } else {
        fsmenu.append(new MenuItem({
            label: 'About',
            click: () => {
                dialog.showMessageBox({
                    type: "info",
                    buttons: ["Ok"],
                    title: "About Snowy Fields DLC",
                    message: aboutMessage
                });
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Fullscreen (Toggle)',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
                win.setFullScreen(!win.isFullScreen());
                win.webContents.send('fullscreen', win.isFullScreen());
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Mute Audio (Toggle)',
            click: () => {
                win.webContents.audioMuted = !win.webContents.audioMuted;
                win.webContents.send('muted', win.webContents.audioMuted);
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Log Out',
            click: () => {
                clearCache();
                win.loadFile('index.html');
            }
        }));
    }
}

function clearCache() {
    windows = BrowserWindow.getAllWindows()[0];
    const ses = win.webContents.session;
    ses.clearCache(() => {});
}

// end of menubar

// Auto update part

autoUpdater.on('update-available', (updateInfo) => {
    win.webContents.send('update_available', updateInfo.version);
});

autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', {
        version: app.getVersion()
    });
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

// end of Auto update part

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
  if (win == null) {createWindow();}
});
