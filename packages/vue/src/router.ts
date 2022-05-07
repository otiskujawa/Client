import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHashHistory } from "vue-router";
import { useState } from "./app";

export type FancyRouteRecord = RouteRecordRaw & { icon?: string };

export const routes: (FancyRouteRecord & { children?: FancyRouteRecord[] })[] = [
	{
		path: "/auth",
		name: "auth",
		component: () => import("./views/Auth/Auth.vue"),
		children: [
			{
				path: "login",
				name: "login",
				component: () => import("./views/Auth/Login.vue"),
			},
			{
				path: "signup",
				name: "signup",
				component: () => import("./views/Auth/Signup.vue"),
			},
		],
	},
	{
		path: "/dashboard",
		name: "dashboard",
		component: () => import("./views/Dashboard/Dashboard.vue"),
		children: [
			{
				path: "machines",
				name: "machines",
				icon: "nas",
				component: () => import("./views/Dashboard/MachinesView.vue"),
				children: [
					{
						path: "machine/:uuid",
						name: "machine",
						component: () => import("./views/Dashboard/MachineView.vue"),
					},
				],
			},
			{
				path: "admin",
				name: "admin",
				icon: "admin",
				component: () => import("./views/Dashboard/AdminView.vue"),
			},
			{
				path: "settings",
				name: "settings",
				icon: "settings",
				component: () => import("./views/Dashboard/SettingsView.vue"),
				children: [
					{
						path: "account",
						name: "settings.account",
						component: () => import("./views/Dashboard/Settings/Account.vue"),
					},
					{
						path: "appearance",
						name: "settings.appearance",
						component: () => import("./views/Dashboard/Settings/Appearance.vue"),
					},
					{
						path: "sounds",
						name: "settings.sounds",
						component: () => import("./views/Dashboard/Settings/Sounds.vue"),
					},
					{
						path: "security",
						name: "settings.security",
						component: () => import("./views/Dashboard/Settings/Security.vue"),
					},
					{
						path: "integrations",
						name: "settings.integrations",
						component: () => import("./views/Dashboard/Settings/Integrations.vue"),
					},
				],
			},
			{
				path: "profile/:uuid?",
				name: "profile",
				icon: "user",
				component: () => import("./views/Dashboard/ProfileView.vue"),
			},
		],
	},
];

const router = createRouter({
	routes,
	history: createWebHashHistory(),
});

router.beforeEach((to, from, next) => {
	if (localStorage.getItem("token") && (to.fullPath === "/"))
		return next({ name: "machines" });

	if (localStorage.getItem("token") === "undefined" && (to.name !== "login" && to.name !== "signup"))
		return next({ name: "login" });

	// redirect to settings.account if user goes to /dashboard/settings
	if (to.name === "settings")
		return next({ name: "settings.account" });

	if (to.name === "admin" && !useState().users.getMe()?.is_admin)
		return next({ name: "machines" });

	next();
});
export default router;
