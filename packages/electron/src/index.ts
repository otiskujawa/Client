import { join } from "path";
import { URL } from "url";
import type { Presence } from "discord-rpc";
import { BrowserWindow, app, ipcMain } from "electron";
import { DiscordRPC } from "./DiscordRPC";
import "./security-restrictions";

const isSingleInstance = app.requestSingleInstanceLock();
const isDevelopment = import.meta.env.MODE === "development";

if (!isSingleInstance) {
	app.quit();
	process.exit(0);
}

// app.disableHardwareAcceleration();

// Install "Vue.js devtools"
if (isDevelopment) {
	app
		.whenReady()
		.then(() => import("electron-devtools-installer"))
		.then(({ default: installExtension, VUEJS3_DEVTOOLS }) =>
			installExtension(VUEJS3_DEVTOOLS, {
				loadExtensionOptions: {
					allowFileAccess: true,
				},
			}),
		)
		.catch(e => console.error("Failed install extension:", e));
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async() => {
	mainWindow = new BrowserWindow({
		show: false, // Use 'ready-to-show' event to show window
		frame: false,
		transparent: process.platform !== "win32",
		icon: "../../../resources/icon.png",
		minHeight: 400,
		minWidth: 400,
		width: 1100,
		vibrancy: "dark",
		title: "Xornet",
		webPreferences: {
			webSecurity: true,
			nativeWindowOpen: true,
			nodeIntegration: true,
			webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
			preload: join(__dirname, "../../preload/dist/index.cjs"),
		},
	});

	/**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
	mainWindow.on("ready-to-show", () => {
		mainWindow?.show();

		if (isDevelopment) {
			// mainWindow?.webContents.openDevTools();
		}
	});

	/**
   * URL for main window.
   * Vite dev server for development.
   * `file://../vue/index.html` for production and test
   */
	const pageUrl
    = isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined ? "http://localhost:3000" : new URL("../vue/dist/index.html", `file://${__dirname}`).toString();

	await mainWindow.loadURL(pageUrl);
};

const discordRPC = new DiscordRPC();

// Listen to events from the frontend
ipcMain.on("event", (_, event: { name: string; data: string }) => {
	switch (event.name) {
		case "rpc":
			discordRPC.updateRichPresence(event.data as Presence);
			break;
		case "rpc-clear":
			discordRPC.clearRichPresesnce();
			break;
		case "refresh":
			mainWindow?.reload();
			break;
		case "close":
			app.quit();
			break;
		case "minimize":
			mainWindow?.minimize();
			break;
		case "maximize":
			mainWindow?.maximize();
			break;
		case "unmaximize":
			mainWindow?.unmaximize();
			break;
		case "restore":
			mainWindow?.restore();
			break;
	}
});

app.on("second-instance", () => {
	// Someone tried to run a second instance, we should focus our window.
	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.focus();
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app
	.whenReady()
	.then(createWindow)
	.catch(e => console.error("Failed create window:", e));

// Auto-updates
if (import.meta.env.PROD) {
	app
		.whenReady()
		.then(() => import("electron-updater"))
		.then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
		.catch(e => console.error("Failed check updates:", e));
}
