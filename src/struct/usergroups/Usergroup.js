const { Collection } = require("discord.js");
const GroupMember = require("./GroupMember");
const GroupRole = require("./GroupRole");

class Usergroup {
	constructor(groupApi, groupData) {
		this.groupApi = groupApi;

		this._id = groupData._id?.toHexString() ?? groupData._id?.toString();
		this.name = groupData.name;
		this.guild = groupData.guild;
		this.owner = groupData.owner ? new GroupMember(this, groupData.owner) : null;

		this.roles = new Collection();
		if (groupData.roles) {
			if (Array.isArray(groupData.roles)) groupData.roles.forEach(roleData => {
				const role = this.makeRole(roleData);
				this.roles.set(role.id, role);
			});
			if (groupData.roles instanceof Collection) this.roles = groupData.roles;
		}

		this.members = new Collection();
		if (groupData.members) {
			if (Array.isArray(groupData.members)) groupData.members.forEach(memberData => {
				const member = this.makeMember(memberData);
				this.members.set(member.id, member);
			});
			if (groupData.members instanceof Collection) this.members = groupData.members;
		}

		this.invited = new Map();
		if (groupData.invited) {
			groupData.invited.forEach(invitedUser => {
				this.invited.set(invitedUser._id, invitedUser);
			});
		}

		this.meta = {
			role_id: groupData.meta?.role_id ?? null,
			desc: groupData.meta?.desc ?? null,
			color: groupData.meta?.color ?? null,
			userbar: groupData.meta?.userbar ?? null,
			sales_price: groupData.meta?.sales_price ?? null,
			buy_in_price: groupData.meta?.buy_in_price ?? 0,
			motd: groupData.meta?.motd ?? null
		}

		this.areas = groupData.areas || [];

		this.createdAt = groupData.createdAt || new Date();
		this.updatedAt = groupData.updatedAt || new Date(this.createdAt);
		this.locked = groupData.locked || 0; // Settings that is locked from changes by Server Admin
		this.flags = groupData.flags || 0; // Group-specific boolean values, may or may not be locked as-is

		/**
		 * Set of changes for minimal update queries
		 * @type {Set<String>}
		 * @private
		 */
		this._changed = new Set();
	}

	/**
	 * Get the ID of this usergroup, if it's from/in DB
	 * @return {String}
	 */
	get id() {
		return this._id;
	}

	/**
	 * Calculates how many text channels this group owns
	 * @return {number}
	 */
	get textChannelCount() {
		return this.areas.reduce((a,b) => a+b.text.length, 0);
	}

	/**
	 * Calculates how many voice channels this group owns
	 * @return {number}
	 */
	get voiceChannelCount() {
		return this.areas.reduce((a,b) => a+b.text.length, 0);
	}

	/**
	 * Check if invited members are still required to buy-in
	 * @return {Boolean}
	 */
	get invitedBuyInRequired() {
		return !!(this.flags & this.groupApi.config.flags.invitedBuyInRequired);
	}
	/**
	 * Sets the BuyIn required flag for members that are invited
	 * @param {Boolean} value
	 */
	set invitedBuyInRequired(value) {
		if (!!value) {
			if (this.invitedBuyInRequired) return;
			this.flags |= this.groupApi.config.flags.invitedBuyInRequired;
			this.changed("flags");
		} else {
			if (!this.invitedBuyInRequired) return;
			this.flags = this.flags & ~this.groupApi.config.flags.invitedBuyInRequired;
			this.changed("flags");
		}
	}

	/**
	 * Get the buy-in price of the usergroup
	 * @return {Number}
	 */
	get buyInPrice() {
		return this.meta.buy_in_price;
	}
	/**
	 * Sets the buy-in price for the usergroup
	 * @param price
	 */
	set buyInPrice(price) {
		if (price === this.buyInPrice) return;
		this.meta.buy_in_price = price;
		this.changed("meta");
	}

	/**
	 * Return the MotD of this group, if it has any
	 * @return {String|null}
	 */
	get motd() {
		return this.meta.motd;
	}
	/**
	 * Sets the MotD content
	 * @param content
	 */
	set motd(content) {
		if (content === this.meta.motd) return;
		this.meta.motd = content;
		this.changed("meta");
	}

	/**
	 * Return the theme colour of this group, if it has any
	 * @param {GuildConfig} [guildConfig] The guild config to check permission for custom color
	 * @returns {Number|null}
	 */
	color(guildConfig) {
		if (this.meta.color===null && guildConfig) return guildConfig.color;

		if (!guildConfig) return this.meta.color;
		if (guildConfig.custom_color) return this.meta.color;
		return guildConfig.color;
	}
	/**
	 * Sets the color value
	 * @param {String|number} hexColor The color hex to set
	 */
	setColor(hexColor) {
		if (typeof(hexColor)==="string") {
			if (hexColor.startsWith("#")) hexColor = hexColor.replace("#","");
			this.meta.color = parseInt(hexColor, 16);
			this.changed("meta");

			return;
		}

		if (0 > hexColor && 0xffffff < hexColor) throw new Error(`HEX colour value out of range`);
		this.meta.color = hexColor;
		this.changed("meta");
	}

	/**
	 * Check if applications is open or not for this group
	 * @returns {Boolean}
	 */
	get applicationsOpen() {
		return !!(this.flags & this.groupApi.config.flags.applicationsOpen);
	}
	/**
	 * Set if applications are open or not for this group
	 * @param {Boolean} value
	 */
	set applicationsOpen(value) {
		if (!!value) {
			if (this.applicationsOpen) return;
			this.flags |= this.groupApi.config.flags.applicationsOpen;
			this.changed("flags");
		} else {
			if (!this.applicationsOpen) return;
			this.flags = this.flags & ~this.groupApi.config.flags.applicationsOpen;
			this.changed("flags");
		}
	}

	/**
	 * See if the group is up for sale or not
	 * @return {boolean}
	 */
	get forSale() {
		return !!(this.flags & this.groupApi.config.flags.forSale);
	}
	/**
	 * Set if a group is up for sale or not
	 * @param {Boolean} value
	 */
	set forSale(value) {
		if (!!value) {
			if (this.forSale) return;
			this.flags |= this.groupApi.config.flags.forSale;
			this.changed("flags");
		} else {
			if (!this.forSale) return;
			this.flags = this.flags & ~this.groupApi.config.flags.forSale;
			this.changed("flags");
		}
	}

	/**
	 * Get how many text channels this group have in total
	 * @return {number}
	 */
	get channelTextCount() {
		let count = 0;
		this.areas.forEach(area => count += area.text.length);
		return count;
	}

	/**
	 * Get how many text channels this group have in total
	 * @return {number}
	 */
	get channelVoiceCount() {
		let count = 0;
		this.areas.forEach(area => count += area.voice.length);
		return count;
	}

	/**
	 * Check if the user by ID is the owner
	 * @param {String} userId
	 * @return {boolean}
	 */
	isOwner(userId) {
		return this.owner.id===userId;
	}

	/**
	 * Check if a user is already a fully blown member
	 * @param {String} userId The user to check
	 * @returns {Boolean}
	 */
	isMember(userId) {
		return this.members.has(userId);

		/*
		const m = this.members.get(userId);
		if (!m) return false;
		return !(m.flags & this.groupApi.config.flags.onlyInvited);
		 */
	}

	/**
	 * Check if a user is invited to the group
	 * @param {String} userId The user to check
	 * @returns {Boolean}
	 */
	isInvited(userId) {
		return this.invited.has(userId);

		/*
		const m = this.members.get(userId);
		if (!m) return false;
		return !!(m.flags & this.groupApi.config.flags.onlyInvited);
		 */
	}

	/**
	 * Mark a field in Usergroup as changed, so .save() saves those changes
	 * @param {String} field
	 */
	changed(field) {
		if (!this.hasOwnProperty(field)) throw new Error(`Unknown field changed '${field}'`);
		this._changed.add(field);
	}

	/**
	 * Creates a new member instance
	 * @param {Object} memberData
	 * @return {GroupMember}
	 */
	makeMember(memberData) {
		return new GroupMember(this, memberData);
	}

	/**
	 * Creates a new GroupRole instance
	 * @param {Object} roleData
	 * @return {GroupRole}
	 */
	makeRole(roleData) {
		return new GroupRole(this, roleData);
	}

	/**
	 * Saves the current state of the Usergroup, or saves new document if ID is not populated
	 * @return {Promise<Usergroup>}
	 */
	async save() {
		// If ID is not populated, we assume it's not inserted yet
		if (!this._id) {
			this._id = this.groupApi.api.mongo.newId;
			await this.groupApi.insert(this);
		}
		// If there is ID, we assume it's from DB or at least in DB, so only update tracked changes
		else {
			if (!this._changed.size) return null;

			const newData = this.toObject();
			delete newData._id;
			for (const key in newData) if (!this._changed.has(key)) delete newData[key];
			this._changed = new Set(); // Reset tracked changes

			await this.groupApi.updateGroup(this._id, newData);
		}

		return this;
	}

	/**
	 * Renames this group
	 * @param newName
	 * @param saveToDB
	 * @return {Promise<*>}
	 */
	async rename(newName, saveToDB=false) {
		return this.groupApi.rename(this.id, newName, saveToDB);
	}

	/**
	 * Sets new description for this usergroup
	 * @param {String} newDesc The new description to be set
	 * @param {Boolean} [saveToDB=false] Whether or not to save new description to DB as well
	 * @return {Promise<String|null>}
	 */
	async setDesc(newDesc, saveToDB=false) {
		return this.groupApi.setDesc(this.id, newDesc, saveToDB);
	}

	/**
	 * Deletes this group permanently, and removes all areas
	 * @param {String} [byUserId] The ID of the user that deleted the group
	 * @return {Promise<Usergroup>}
	 */
	async delete(byUserId) {
		return this.groupApi.deleteGroup(this.id, byUserId);
	}

	/**
	 * Adds a channel for this usergroup
	 * @param {'text'|'voice'} channelType The type of channel
	 * @param {String} channelName Name of the new channel
	 * @param {String} [parentId] The ID of the parent category, if any
	 * @param {String} [byUserId] The ID of the user that created the channel
	 * @return {Promise<*|null|undefined>}
	 */
	async addChannel(channelType, channelName, parentId, byUserId) {
		return this.groupApi.addChannel(this.id, channelType, channelName, parentId, byUserId);
	}

	/**
	 * Marks a channel as deleted
	 * @param {String} channelId The ID of the channel
	 * @param {String} [byUserId] The ID of the user that created the channel
	 * @return {Promise<*|null|undefined>}
	 */
	async deleteChannel(channelId, byUserId) {
		return this.groupApi.deleteChannel(this.id, channelId, byUserId);
	}

	/**
	 * Make a user leave the guild
	 * @param {String} userId The member that is leaving
	 * @param {String} [reason="Unknown reason"] The reason why the member is being removed
	 * @return {Promise<*>}
	 */
	async removeMember(userId, reason="Unknown reason") {
		return this.groupApi.removeMember(this.id, userId, reason);
	}

	/**
	 * Attempts to remove the Group Guild Role from a user by ID
	 * @param {String} userId
	 * @param {String} reason
	 * @return {Promise<void>}
	 */
	async removeRole(userId, reason="Unknown reason") {
		return this.groupApi.removeRole(this, userId, reason);
	}

	/**
	 * Attempts to add the Group Guild Role to a user by ID
	 * @param {String} userId
	 * @param {String} reason
	 * @return {Promise<void|*>}
	 */
	async addRole(userId, reason="Unknown reason") {
		return this.groupApi.addRole(this, userId, reason);
	}

	/**
	 * Adds a user by ID to the group
	 * @param {String} userId The ID of the user to add to the group
	 * @param {String} addedBy The user that added the user
	 * @param {Boolean} [grantRole=true] Automatically try to give user the Group Guild role
	 * @param {Boolean} [saveToDB=false] Automatically save to DB
 	 * @return {Promise<null|GroupMember>} Null if already a member
	 */
	async addMember(userId, addedBy, grantRole=true, saveToDB=false) {
		if (this.members.has(userId)) return null;

		const member = this.makeMember({_id: userId, by: addedBy});
		this.members.set(member.id, member);
		this.changed("members");

		if (grantRole) {
			const guild = this.groupApi.api.bot.guilds.resolve(this.guild);
			if (guild) {
				const guildMember = await guild.members.fetch(userId);
				if (guildMember) await guildMember.roles.add(this.meta.role_id, `User was added to the usergroup`);
			}
		}

		if (saveToDB) await this.save();

		return member;
	}

	/**
	 * Invites user to the group
	 * @param {String} userId The user to invite to the group
	 * @param {String} invitedBy The user that invited this user
	 * @param {Boolean} [saveToDB=false] Automatically save to DB
	 * @return {Promise<void>}
	 */
	async inviteMember(userId, invitedBy, saveToDB=false) {
		return this.groupApi.inviteMember(this.id, userId, invitedBy, saveToDB);
	}

	/**
	 * Creates a new channel for this group
	 * @param {'voice'|'text'} type The type of channel
	 * @param {String} name The name of the channel
	 * @param {String} [by] The ID of the user that created the channel
	 * @return {Promise<TextChannel|VoiceChannel|void>}
	 */
	async createChannel(type, name, by="Unknown user") {
		return this.groupApi.createChannel(this.id, type, name, by);
	}

	/**
	 * Converts the usergroup to plain JS object
	 * @return {{owner: {createdAt: (*|Date), role, by: *, flags: (*|number), _id: String}, guild, meta: (*|{motd: ((function(): (String|null))|(function(*))|*|null), userbar: (*|null), color: (*|null), role_id: (*|null), sales_price: ({default: null, min: number, max: number, type: Number | NumberConstructor}|*|null), desc: (*|null), buy_in_price: (number|{default: number, min: number, max: number, type: Number | NumberConstructor}|*)}), roles, members, name, invited: unknown[], flags: (*|number), areas: (*|[module:mongoose.Schema<Document, Model<any, any, any>, undefined, ExtractMethods<Model<any, any, any>>>]|HTMLCollection|*[]), _id: (*|string|string), locked: (*|number)}}
	 */
	toObject() {
		return {
			_id: this._id,
			name: this.name,
			guild: this.guild,
			owner: this.owner.toObject(),
			meta: this.meta,
			roles: this.roles.map(r => r.toObject()),
			members: this.members.map(m => m.toObject()),
			invited: Array.from(this.invited.values()),
			areas: this.areas,
			locked: this.locked,
			flags: this.flags,
		}
	}
}

module.exports = Usergroup;