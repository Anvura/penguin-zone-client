const { app, dialog, BrowserWindow, Menu, MenuItem } = require('electron')
const path = require('path')
const DiscordRPC = require('discord-rpc');
const { autoUpdater } = require('electron-updater');

let pluginName
var win
let rpc
let updateAv = false;

// START OF FLASH PLAYER

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
		app.commandLine.appendSwitch('no-sandbox')
		pluginName = 'flash/libpepflashplayer.so'
		break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

// END OF FLASH PLAYER

// START OF DEEP LINK

app.setAsDefaultProtocolClient('penguinzone')

app.on('open-url', (event, url) => {
	event.preventDefault();
});

// END OF DEEP LINK

// START OF CREATE WINDOW

app.on('ready', () => {
	createWindow();
})

const createWindow = () => {
	win = new BrowserWindow({
		title: "Penguin Zone",
		webPreferences: {
			plugins: true,
			nodeIntegration: true
		},
		width: 1385,
		height: 840
	})

    makeMenu();
    Menu.setApplicationMenu(fsmenu);

	updateDiscordRPC()

	win.loadURL('https://penguinzone.ca/');

	autoUpdater.checkForUpdatesAndNotify();

	win.on('closed', () => {
		win = null;
	});
}

// END OF CREATE WINDOW

// START OF MENU

const aboutMessage = `Penguin Zone Client v${app.getVersion()}
					\nCreated by Random with much code provided by Allinol for use with Coastal Freeze and Snowy Fields.
					\nMany edits by Blackout for Penguin Zone.
					\nThe Founders of Penguin Zone are Mjjrrb905 and limegreenicy.`;

function makeMenu() { // credits to random, some changes by Blackout for Penguin Zone
    fsmenu = new Menu();
    if (process.platform == 'darwin') {
        fsmenu.append(new MenuItem({
            label: "Penguin Zone",
            submenu: [{
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: "info",
                            buttons: ["Ok"],
                            title: "About Penguin Zone Client",
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
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        reload();
                    }
                },
                {
                    label: 'Clear Cache',
					accelerator: 'CmdOrCtrl+Shift+C',
                    click: () => {
                        clearCache();
                        win.loadURL('https://penguinzone.ca/');
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
                    title: "About Penguin Zone Client",
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
            label: 'Reload',
			accelerator: 'CmdOrCtrl+R',
            click: () => {
                reload();
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Clear Cache',
			accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
                clearCache();
                win.loadURL('https://penguinzone.ca/');
            }
        }));
    }
}

function reload() {
    win.reload();
}

function clearCache() {
    windows = BrowserWindow.getAllWindows()[0];
    const ses = win.webContents.session;
    ses.clearCache(() => {});
}

// END OF MENU

// START OF DISCORD RPC

function updateDiscordRPC() { 
	const clientId = '1047486604035498055'; 
	DiscordRPC.register(clientId);
	rpc = new DiscordRPC.Client({ transport: 'ipc' }); 
	const startTimestamp = new Date();
	rpc.login({ clientId }).catch();

	win.webContents.on('did-navigate', (event, url) => {
		let details = 'Staring at the Home Page!';

		if (url === 'https://penguinzonetesting.github.io/events/') {
			details = 'Checking out Upcoming Events';
		} else if (url === 'https://penguinzonetesting.github.io/play/') {
			details = 'Waddling around the World!';
		}

		rpc.setActivity({
			details,
			startTimestamp,
			largeImageKey: 'penguin_zone_logo',
			largeImageText: `Penguin Zone Client | v${app.getVersion()}`,
			buttons: [
				{
					url: `https://penguinzone.ca/download`,
					label: `Download Client`
				},
				{
					url: `penguinzone://`,
					label: `Launch Client`
				}
			]
		});
	});
}

// END OF DISCORD RPC

// START OF AUTO UPDATER

autoUpdater.on('update-available', (updateInfo) => {
	switch (process.platform) {
		case 'win32':
			dialog.showMessageBox({
				type: 'info',
				buttons: ["Ok"],
				title: "Update Available",
				message: "There is a new version available (v" + updateInfo.version + "). It will be installed when the app closes."
			});
			break
		case 'win32':
			dialog.showMessageBox({
				type: 'info',
				buttons: ["Ok"],
				title: "Update Available",
				message: "There is a new version available (v" + updateInfo.version + "). Please go install it manually from the website."
			});
			break
		case 'win32':
			dialog.showMessageBox({
				type: 'info',
				buttons: ["Ok"],
				title: "Update Available",
				message: "There is a new version available (v" + updateInfo.version + "). Auto-update has not been tested on this OS, so if after relaunching app this appears again, please go install it manually."
			});
			break
	}
})

autoUpdater.on('update-downloaded', () => {
	updateAv = true;
})

app.on('window-all-closed', () => {
	if (updateAv) {
		autoUpdater.quitAndInstall();
	} else {
		if (process.platform !== 'darwin') {
			app.quit()
		}
	}
})

// END OF AUTO UPDATER

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});