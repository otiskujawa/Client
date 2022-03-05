import { useState } from "../app";
import router from "../router";

/**
 *  Returns true if the user is on the electron client
 */
export function isElectron() {
	// Renderer process
	if (typeof window !== "undefined" && typeof window.process === "object")
		return true;

	// Main process
	if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron)
		return true;

	// Detect the user agent when the `nodeIntegration` option is set to true
	if (
		typeof navigator === "object"
    && typeof navigator.userAgent === "string"
    && navigator.userAgent.includes("Electron")
	)
		return true;

	return false;
}

export const padNumber = (time: number) => {
	const floored = ~~time;
	return floored > 9 ? floored : `0${floored}`;
};

export const formatEpoch = (ms?: number) => {
	if (!ms) return undefined;
	const days = ~~(ms / (24 * 60 * 60 * 1000));
	const daysms = ms % (24 * 60 * 60 * 1000);
	const hours = ~~(daysms / (60 * 60 * 1000));
	const hoursms = ms % (60 * 60 * 1000);
	const minutes = ~~(hoursms / (60 * 1000));
	const minutesms = ms % (60 * 1000);
	const sec = ~~(minutesms / 1000);
	return `${padNumber(days)}:${padNumber(hours)}:${padNumber(minutes)}:${padNumber(sec)}`;
};

export const detectBrowser = () => {
	if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) !== -1)
		return "opera";

	else if (navigator.userAgent.includes("Chrome"))
		return "chrome";

	else if (navigator.userAgent.includes("Safari"))
		return "safari";

	else if (navigator.userAgent.includes("Firefox"))
		return "firefox";

	else
		return null;
};

/**
 * Sends a message to electron's node backend
 * @param name the name of the event
 * @param data the data to send
 */
export function nodeEmit(name: string, data?: any) {
	window.postMessage({ name, data });
}

/**
 * Gets the icon key name for a specific distro
 * @param name The os name of the machine to search through
 */
export const getMachineOsImageKey = (name: string) => {
	if (!name) return;
	const lowerCasedName = name.toLowerCase();
	if (lowerCasedName.includes("alpine")) return "alpine";
	else if (lowerCasedName.includes("arch")) return "arch";
	else if (lowerCasedName.includes("debian")) return "debian";
	else if (lowerCasedName.includes("freebsd")) return "freebsd";
	else if (lowerCasedName.includes("oracle linux server")) return "fedora";
	else if (lowerCasedName.includes("popos")) return "popos";
	else if (lowerCasedName.includes("red hat")) return "redhat";
	else if (lowerCasedName.includes("ubuntu")) return "ubuntu";
	else if (lowerCasedName.includes("openwrt")) return "openwrt";
	else if (lowerCasedName.includes("suse")) return "suse";
	else if (lowerCasedName.includes("endeavour")) return "endeavour";
	else if (lowerCasedName.includes("garuda")) return "garuda";
	else if (lowerCasedName.includes("raspbian")) return "raspbian";
	else if (lowerCasedName.includes("darwin")) return "darwin";
	else if (lowerCasedName.includes("windows")) return "windows10";
	else if (lowerCasedName.includes("kubuntu")) return "kubuntu";
	else if (lowerCasedName.includes("nixos")) return "nixos";
};

export const logout = () => {
	router.push({ name: "login" });
	useState().users.logout();
};
