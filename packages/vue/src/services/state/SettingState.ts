import { useLocalStorage } from "@vueuse/core";
import { watch } from "vue";
import { isElectron } from "../logic";
import xornet from "/@/app";

/**
 * This keeps track of the user's settings and updates the local storage
 */
export class SettingsState {
	public client = useLocalStorage("clientOnlySettings", {
		enable_rich_presence: true,
	}).value;

	// These are snake cased because they are used to index the JSONs we get from the backend as well
	public general = useLocalStorage("generalSettings", {
		opacity: 100,
		sound_volume: 100,
		theme: "dark",
		minimum_blink_speed: 0.01,
		enable_bloom: true,
		rounded_network_interfaces: false,
		filled_network_interfaces: false,
		use_single_color_for_network_interfaces: false,
		use_new_blink_algorithm: true,
		enable_totals: false,
		enable_sound_effects: false,
		show_owned: false,
		fixed_column_width: false,
	}).value;

	public columns = useLocalStorage("columnsrwnsjddinf", {
		hostname: true,
		os_name: false,
		status: true,
		cau: true,
		cas: false,
		ram_usage: true,
		gpu_usage: false,
		gpu_power_usage: false,
		network_switch: true,
		docker_switch: true,
		firewall_switch: false,
		td: true,
		tu: true,
		tvd: false,
		tvu: false,
		temperature: false,
		country: false,
		public_ip: false,
		process_count: false,
		host_uptime: false,
		reporter_uptime: false,
		reporter_version: false,
		owner: true,
	}, { deep: true }).value;

	constructor() {
		this.registerWatchers();
		this.applyCurrentTheme();
		this.applyCurrentOpacity();
	}

	public toObject() {
		const obj: {[key: string]: any} = {
			general: {},
			columns: {},
		};

		for (const category of Object.keys(obj)) {
			// @ts-ignore
			for (const [key, value] of Object.entries(this[category]))
				obj[category][key] = value;
		}

		return obj;
	}

	private registerWatchers(): void {
		watch(
			() => this.general.theme,
			() => this.applyCurrentTheme(),
		);
		watch(
			() => this.general.opacity,
			() => this.applyCurrentOpacity(),
		);
		watch(
			() => this.client.enable_rich_presence,
			(before, after) => after && xornet.Discord.clearPresence(),
		);
	}

	private applyCurrentTheme() {
		const dom = document.querySelector("html");
		dom!.className = `theme-${this.general.theme}`;
	}

	private applyCurrentOpacity() {
		// This is a hack
		setTimeout(() => {
			const main = <HTMLElement>document.querySelector("#main");
			main!.style.setProperty("--tw-bg-opacity", (isElectron() ? (this.general.opacity / 100) : 100).toString());
		}, 10);
	}
}
