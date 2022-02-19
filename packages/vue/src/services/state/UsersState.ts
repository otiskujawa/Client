import type { RemovableRef } from "@vueuse/core";
import { useLocalStorage } from "@vueuse/core";
import type { uuid } from "/@/types/api";
import type { IUser } from "/@/types/api/user";
import type { API } from "/@/services/api";
import { State } from "/@/services/state/State";

export interface IUsersState {
	users: Record<uuid, IUser>
	me_uuid: uuid | undefined
}

export interface UserLoginInput {
	[key: string]: any
	password: string
	username: string
}

export interface UserSignupInput extends UserLoginInput {
	[key: string]: any
	email: string
}

/**
 * This keeps track of all the cached users including the logged in user
 */
export class UsersState extends State<IUsersState> {
	private token: RemovableRef<string> = useLocalStorage("token", "undefined");
	private requestQueue: Record<uuid, Promise<void>> = {};

	public constructor(public api: API) {
		super({
			me_uuid: undefined,
			users: {},
		});
	}

	/**
	 * This is a smart lock system that will deny repetitive requests and only do them once
	 * (this should be improved with some async lock of some sort)
	 */
	private async requestUser(uuid: uuid) {
		if (this.requestQueue[uuid] !== undefined) return;
		this.requestQueue[uuid] = this.fetch(uuid);
		await this.requestQueue[uuid];
		delete this.requestQueue[uuid];
	}

	/**
	 * Resets this state
	 */
	private reset() {
		delete this.state.me_uuid;
		localStorage.clear();
		this.setUsers([]);
	}

	/**
	 * Sets the user in the state and as me
	 */
	protected setMe(user: IUser) {
		this.set(user); 													// Set the user
		this.state.me_uuid = user.uuid; 					// Set this user as me
	}

	/**
	 * Set the avatar of a user in the state
	 * @param user The user to set the avatar of
	 * @param avatar The URL of the avatar to set
	 */
	protected setAvatar(user: IUser, avatar: string) {
		this.state.users[user.uuid].avatar = avatar;
	}

	/**
	 * Update the avatar of me in the backend and set the new avatar in the state
	 * @param avatar The URL of the avatar to set
	 */
	public async updateAvatar(avatar: string) {
		const me = this.getMe();
		me && this.api.request<IUser>("PATCH", "/users/@avatar", { url: avatar }).then((me: IUser) => this.setAvatar(me, avatar));
	}

	/**
	 * Gets the me user from the state and if it doesn't exist it fetches it from the backend
	 */
	public getMe() {
		return this.get(this.state.me_uuid!);		 	// Return the user from the Record
	}

	/**
	 * Fetches the current logged in user object from the backend and sets it
	 */
	public async fetchMe() {
		const user: IUser = await this.api.request("GET", "/users/@me");
		this.setMe(user);
	}

	/**
	 * Fetches a user from the backend and sets it
	 */
	protected async fetch(uuid: uuid) {
		if (!uuid) return;
		const user: IUser = await this.api.request("GET", `/users/${uuid}`);
		this.set(user);
	}

	/**
	 * Get the user's current login token
	 */
	public getToken() {
		return this.token.value;
	}

	/**
	 * Logs a user out and resets the state
	 */
	public logout() {
		this.reset();
	}

	/**
	 * Logs in a user to the backend and sets the return user in the state
	 */
	public async login(form: UserLoginInput) {
		const response: {token: string; user: IUser} = await this.api.request("POST", "/users/@login", form);
		this.token.value = response.token;
		this.setMe(response.user);
	}

	/**
	 * Signs up a user to the backend and sets the return user in the state
	 */
	public async signup(form: UserSignupInput) {
		const response: {token: string; user: IUser} = await this.api.request("POST", "/users/@signup", form);
		this.token.value = response.token;
		this.setMe(response.user);
	}

	/**
	 * Sets an array of users to the state
	 */
	protected setUsers(users: IUser[]) {
		users.forEach(user => this.set(user));
	}

	/**
	 * Sets a user to the state
	 */
	protected set(user: IUser) {
		this.state.users[user.uuid] = user;
	}

	/**
	 * Gets a user from the state and if it doesn't exist fetches it
	 */
	public get(uuid: uuid) {
		const user = this.state.users[uuid];
		if (!user) this.requestUser(uuid);
		return user;
	}
}
