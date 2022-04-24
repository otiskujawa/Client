import { computed } from "vue";
import { useState } from "../app";
import router from "../router";
import type { IMachine } from "../types/api/machine";
import { isElectron, nodeEmit } from "./logic";

export type CommandPalleteOptionCategory = "route" | "machine" | "appearance" | "sound" | "theme" | "setting";

export interface CommandPalleteOption {
	title: string
	icon?: string
	electronOnly?: boolean
	category: CommandPalleteOptionCategory
	onClickHandler?: Function
}

const state = useState();

const defineOption = (onClickHandler: Function, category: CommandPalleteOptionCategory, title: string, icon: string, electronOnly = false) => {
	return {
		onClickHandler,
		category,
		title,
		icon,
		electronOnly,
	};
};

const defineThemeCommands = (themes: string[]): CommandPalleteOption[] => {
	return themes.map(theme => defineOption(
		() => state.settings.general.theme = theme,
		"theme",
		`Set <strong>${theme}</strong> theme`,
		"color-palette",
	));
};

const defineMachineCommands = (machines: IMachine[]): CommandPalleteOption[] => {
	return machines.map(machine => defineOption(
		() => router.push({ name: "machine", params: { uuid: machine.uuid } }),
		"machine",
		`Machine <strong>${machine.name}</strong>`,
		"nas",
	));
};

export const commandPaletteOptions = computed<CommandPalleteOption[]>(() => ([
	...defineThemeCommands(["nord", "dark", "opera", "galaxy"]),
	...defineMachineCommands(state.machines.getAll()),
	defineOption(
		() => isElectron() ? nodeEmit("refresh") : location.reload(),
		"setting",
		"Reload Page",
		"synchronize",
	),
	defineOption(
		() => state.settings.client.enable_rich_presence = !state.settings.client.enable_rich_presence,
		"appearance",
		"Toggle Discord Rich Presence",
		"color-palette",
		true,
	),
	defineOption(
		() => state.settings.general.enable_bloom = !state.settings.general.enable_bloom,
		"appearance",
		"Toggle bloom",
		"palette",
	),
	defineOption(
		() => state.settings.general.fixed_column_width = !state.settings.general.fixed_column_width,
		"appearance",
		"Toggle fixed column width",
		"command-palette",
	),
	defineOption(
		() => state.settings.general.enable_sound_effects = !state.settings.general.enable_sound_effects,
		"sound",
		"Toggle sound effects",
		"sound",
	),
	defineOption(
		() => state.settings.general.enable_totals = !state.settings.general.enable_totals,
		"appearance",
		"Toggle total stats",
		"command-palette",
	),
	defineOption(
		() => router.push({ name: "profile" }),
		"route",
		"Profile Page",
		"user",
	),
	defineOption(
		() => router.push({ name: "machines" }),
		"route",
		"Machines Page",
		"nas",
	),
	defineOption(
		() => router.push({ name: "settings" }),
		"route",
		"Settings Page",
		"settings",
	),
]));
