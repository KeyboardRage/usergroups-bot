const Color = require("../../struct/tools/Color");
const Usergroup = require("./Usergroup");
const { Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * @prop {module:"discord.js".Collection<String, Usergroup>} groups Usergroups, where key is Group ID
 * @prop {Object} tools
 */
class GroupAPI {
	constructor(group_config) {
		this.config = group_config;

		/**
		 * @type {Collection<String, Usergroup>}
		 */
		this.groups = new Collection();

		/**
		 * @type {Object}
		 */
		this.tools = Object();
		fs.readdirSync(path.join(__dirname, "./tools")).forEach(file => {
			this.tools[path.basename(file, ".js")] = require(path.join(__dirname, "./tools", file))
		});
	}

	/**
	 * Sets the Global API circular dependency
	 * @param {GlobalAPI} api
	 */
	setApi(api) {
		this.api = api;

		this.query = new Proxy(this.api.mongo.query, {
			get(target, prop) {
				return target.usergroups[prop];
			}
		});
	}

	/**
	 * Loads all usergroups from database into memory
	 * @return {Promise<void>}
	 */
	async loadAllGroups() {
		const groupsData = await this.query.getAll();
		groupsData.forEach(groupData => {
			const group = this.makeGroup(groupData);
			this.groups.set(group.id, group);
		});

		console.info("[OK] %s Usergroups loaded", this.groups.size);
	}

	/**
	 * Retrieve a specific group by ID
	 * @param {String} groupId The unique ID of the group to get
	 * @return {Promise<Usergroup|null>}
	 */
	async getGroup(groupId) {
		if (this.groups.has(groupId)) return this.groups.get(groupId);
		const groupData = await this.query.getById(groupId);
		if (!groupData) return null;

		const group = this.makeGroup(groupData);
		this.groups.set(group.id, group);
		return group;
	}

	/**
	 * Get all groups by a given ID
	 * @param {Array<String>} groupIds A list of group ID's to get
	 * @return {Promise<Collection<String, Usergroup>>}
	 */
	async getGroups(groupIds) {
		const groupsData = await this.query.getGroupsByIds(
			// Only fetch the ones not in cache
			groupIds.filter(g=>!this.groups.has(g.toString()))
		);

		// Create new container collection
		const groups = new Collection();

		// Cache those not in cache
		groupsData.forEach(groupData => {
			const group = this.makeGroup(groupData);
			this.groups.set(group.id, group);
			groups.set(group.id, group);
		});

		groupIds.forEach(id => {
			if (!groups.has(id)) groups.set(id, this.groups.get(id));
		});

		// Use cache to create a collection of the groups requested
		return groups;
	}

	/**
	 * Returns a collection of all groups within a guild
	 * @param {String} guildId The ID of the guild
	 * @return {Promise<Collection<String, Usergroup>>}
	 */
	async groupsFromGuild(guildId) {
		// Find all the groups this guild has
		const allGroupIds = await this.query.findGroupsInGuild(guildId, true);

		// Retrieve those groups and cache them
		return await this.getGroups(allGroupIds.map(g => g._id.toHexString()));
	}

	/**
	 * Resolves Group from Discord Text Channel ID
	 * @param {String} channelId The text channel to find out if associated with guild
	 * @return {Promise<Usergroup|null>}
	 */
	async groupFromTextChannel(channelId) {
		let group = this.groups.find(g => {
			if (!g.areas.length) return false;
			return g.areas.forEach(area => area.text.includes(channelId));
		});
		if (group) return group;

		const groupData = await this.query.findGroupWithTextChannel(channelId);
		if (!groupData) return null;

		group = this.makeGroup(groupData);
		this.groups.set(group.id, group);

		return group;
	}

	/**
	 * Get a group by voice or text channel ID
	 * @param {String} guildId The ID of the guild the channel belong to
	 * @param {String} channelId The ID of the channel
	 * @return {Promise<Usergroup|null>}
	 */
	async getGroupFromChannel(guildId, channelId) {
		let group = this.groups.find(g => {
			if (g.guild!==guildId) return false;
			if (!g.areas.length) return false;
			return g.areas.forEach(area => area.voice.includes(channelId) || area.text.includes(channelId));
		});
		if (group) return group;

		const groupData = await this.query.getGroupFromChannel(guildId, channelId);
		if (!groupData) return null;

		group = this.makeGroup(groupData);
		this.groups.set(group.id, group);

		return group;
	}

	/**
	 * Resolves Group from Name and Guild ID
	 * @param {String} name The name of the group to find
	 * @param {String} guildId The ID of the guild this group is in
	 * @return {Promise<Usergroup|null>}
	 */
	async groupFromNameAndGuild(name, guildId) {
		name = name.toLowerCase();
		let group = this.groups.find(g => g.name.toLowerCase()===name && g.guild === guildId);
		if (group) return group;

		const groupsOfGuild = await this.query.findGroupsInGuild(guildId);

		for (const groupData of groupsOfGuild) {
			if (!this.groups.has(groupData._id)) {
				const g = this.makeGroup(groupData);
				this.groups.set(g.id, g);

				if (groupData.name.toLowerCase()===name) return g;
			}
		}

		return null;
	}

	/**
	 * Check if a group name is taken or not
	 * @param {String} guildId The Id of the guild
	 * @param {String} groupName The name of the group
	 * @return {Promise<boolean>}
	 */
	async taken(guildId, groupName) {
		groupName = groupName.toLowerCase();

		const groupsOfGuild = await this.query.findGroupsInGuild(guildId);

		for (const groupData of groupsOfGuild) {
			if (!this.groups.has(groupData._id)) {
				const g = this.makeGroup(groupData);
				this.groups.set(g.id, g);
			}
			if (groupData.name.toLowerCase()===groupName) return true;
		}

		return this.groups.has(groupName.toLowerCase());
	}

	/**
	 * Creates a new Usergroup instance
	 * @param {Object} groupData
	 * @return {Usergroup}
	 */
	makeGroup(groupData) {
		return new Usergroup(this, groupData);
	}

	/**
	 * Resolves Group ID based on if it's the current channel, or the name of the group if present
	 * @param {SlashPayload} payload
	 * @param {String} [groupName] The name of the group to get
	 * @returns {Promise<Usergroup|null>}
	 */
	resolve(payload, groupName) {
		if (groupName) return this.groupFromNameAndGuild(
			groupName,
			payload.guild.id
		);
		return this.groupFromTextChannel(payload.int.channel.id);
	}

	/**
	 * @typedef {Object} GroupValidationResult
	 * @prop {Boolean} valid If it's valid or not
	 * @prop {String} message The reason why it's not valid
	 * @prop {*} [value] The normalised value you will use. Only populated if valid
	 */
	/**
	 * Validate a part of the usergroup
	 * @param {'name'|'desc'|'channel'|'vc-name'|'tc-name'|'motd'|'color'|'channel_topic'} field The name to validate
	 * @param {*} value The value to be validated
	 * @returns {GroupValidationResult}
	 */
	validate(field, value) {
		switch(field) {
			case "name": {
				if (value.length > this.config.max.nameLength) return {
					valid: false,
					message: `Group names can be max ${this.config.max.nameLength} characters long`
				}
				if (!this.config.regex.name.fn(value)) return {
					valid: false,
					message: `Group name contains invalid characters. Permitted: ${this.config.regex.name.display}`
				}

				return {
					valid: true,
					message: null,
				}
			}
			case "desc": {
				if (value.length > this.config.max.descLength) return {
					valid: false,
					message: `Description is too long. Max length is ${this.config.max.descLength} characters`
				}

				return {
					valid: true,
					message: null,
				}
			}
			case "channel": {
				if (value.length > this.config.max.channelNameLength) return {
					valid: false,
					message: `Channel name is too long. Max length is ${this.config.max.channelNameLength} characters.`
				}

				return {
					valid: true,
					message: null
				}
			}
			case "vc-name": {
				if (value.length > this.config.max.channelNameLength) return {
					valid: false,
					message: `Channel name is too long. Max length is ${this.config.max.channelNameLength} characters.`
				}

				return {
					valid: true,
					message: null
				}
			}
			case "tc-name": {
				if (value.length > this.config.max.channelNameLength) return {
					valid: false,
					message: `Channel name is too long. Max length is ${this.config.max.channelNameLength} characters.`
				}

				return {
					valid: true,
					message: null
				}
			}
			case "motd": {
				if (value.length > this.config.max.motdLength) return {
					valid: false,
					message: `Message of the Day is too long. Max length is ${this.config.max.motdLength} characters.`
				}

				return {
					valid: true,
					message: null
				}
			}
			case "color":
				return Color.validateHEX(value);
			case "channel_topic": {
				if (value.length > 1024) return {
					valid: false,
					message: `The topic can be max 1024 characters`
				}

				return {
					valid: true,
					message: null
				}
			}
			default:
				throw new Error(`Unknown field '${field}'`);
		}
	}

	/**
	 * Inserts a group into DB and cache
	 * @param {Usergroup} group
	 * @returns {Promise<Usergroup>}
	 */
	async insert(group) {
		if (!(group instanceof Usergroup)) throw new TypeError(`Expected Usergroup, got '${group.constructor.name}'`);

		this.groups.set(group.id, group);
		await this.query.insert(group.toObject());

		return group;
	}

	/**
	 * Updates a usergroup with new data
	 * @param {String} groupId ID of the usergroup
	 * @param {Object} newData The new data to be set
	 * @return {Promise<Object>}
	 */
	async updateGroup(groupId, newData) {
		return this.query.updateData(groupId, newData);
	}

	/**
	 * Sets up group with the necessary:
	 * * creates guild role
	 * * creates category with role having read permissions
	 * * creates channels within category
	 * * assigns guild role to owner
	 * @param {Usergroup} group The usergroup instance
	 * @param {SlashPayload} payload The payload
	 * @return {Promise<{owner: GuildMember, role: Role, channel: TextChannel, category: CategoryChannel}>}
	 */
	async setup(group, payload) {
		if (!(group instanceof Usergroup)) throw new TypeError(`Expected Usergroup, got '${group.constructor.name}'`);

		// Set up the role
		const role = await payload.guild.roles.create({
			name: `${payload.config.prefix.role?payload.config.prefix.role:""}${group.name}`,
			reason: `${payload.user.id} used new group command`,
			color: payload.config.color || undefined
		});
		// Cache the role ID in the group
		group.meta.role_id = role.id;

		// Setup category and channels
		const category = await payload.guild.channels.create(
			`${payload.config.prefix.category?payload.config.prefix.category:""}${group.name}`, {
			type: "GUILD_CATEGORY",
			topic: `Private category for ${group.name}`,
			reason: `${payload.user.id} used new group command`,
			permissionOverwrites: this.tools.channelManager.makeCategoryPermissions({
				groupApi: this,
				ownerId: group.owner.id,
				guildId: payload.guild.id,
				roleId: role.id
			})
		});

		// Set up new channel inside category
		const channel = await payload.guild.channels.create("general", {
			type: "GUILD_TEXT",
			topic: `Private text channel for ${group.name}`,
			reason: `${payload.user.id} used new group command`,
			parent: category.id
		});

		// Set up an area
		group.areas.push({
			_id: category.id,
			text: [channel.id],
			voice: []
		});

		// Assign role to the owner
		const owner = await payload.guild.members.fetch(group.owner.id);
		await owner.roles.add(
			role.id,
			`${payload.user.id} used new group command`
		);

		return {
			owner,
			category,
			channel,
			role
		}
	}

	/**
	 * Renames a group by ID to a new name
	 * @param {String} groupId The ID of the group
	 * @param {String} newName The new name of the group
	 * @param {Boolean} [saveToDB=false] Whether or not to save new name to DB as well
	 * @return {Promise<String|null>} The old group name
	 */
	async rename(groupId, newName, saveToDB=false) {
		const group = await this.getGroup(groupId);
		if (!group) return null;

		const oldName = group.name;
		group.name = newName;
		group.changed("name");
		if (saveToDB) await this.updateGroup(group.id, {name: group.name});
		return oldName;
	}

	/**
	 * Sets description for a group by ID
	 * @param {String} groupId The ID of the group
	 * @param {String} newDesc The new description of the group
	 * @param {Boolean} [saveToDB=false] Whether or not to save new description to DB as well
	 * @return {Promise<String|null>} The old group description, if there was any
	 */
	async setDesc(groupId, newDesc, saveToDB=false) {
		const group = await this.getGroup(groupId);
		if (!group) return null;

		const oldDesc = group.meta.desc;
		group.meta.desc = newDesc;
		group.changed("meta");
		if (saveToDB) await this.updateGroup(group.id, {"meta.desc": newDesc});
		return oldDesc;
	}

	/**
	 * Permanently deletes a group, and removes all areas
	 * @param {String} groupId The ID of the group
	 * @param {String} [byUser] The ID of the user that deleted the group
	 * @return {Promise<Usergroup>}
	 */
	async deleteGroup(groupId, byUser) {
		const group = await this.getGroup(groupId);
		if (!group) return null;
		const guild = this.api.bot.guilds.resolve(group.guild);
		if (!guild) return null;

		// Remove from cache and DB
		await this.query.delete(groupId);
		this.groups.delete(group.id);

		// Remove areas
		const rm = id => {
			try {
				const ch = guild.channels.resolve(id);
				if (ch) return ch.delete(`Group terminated by ${byUser?byUser:"an unknown user"}`);
				else return null;
			} catch(_){
				return null;
			}
		}
		const deleted = Array();
		group.areas.forEach(area => {
			area.text.forEach(a => deleted.push(rm(a)));
			area.voice.forEach(a => deleted.push(rm(a)));
			deleted.push(rm(area._id));
		});
		await Promise.all(deleted);

		// Remove role
		try {
			const role = await guild.roles.fetch(group.meta.role_id, false);
			if (role) role.delete(`Group terminated by ${byUser?byUser:"an unknown user"}`);
		} catch(_) {}

		return group;
	}

	/**
	 * Adds a channel for this usergroup
	 * @param {String} groupId The ID of the group who's getting a new channel
	 * @param {'text'|'voice'} channelType The type of channel
	 * @param {String} channelName Name of the new channel
	 * @param {String} [parentId] The ID of the parent category, if any
	 * @param {String} [byUserId] The ID of the user that created the channel
	 * @return {Promise<TextChannel|VoiceChannel>}
	 * @deprecated Is this used anywhere?
	 */
	async addChannel(groupId, channelType, channelName, parentId, byUserId) {
		const group = await this.getGroup(groupId);
		if (!group) return null;
		const guild = this.api.bot.guilds.resolve(group.guild);
		if (!guild) return null;
		if (!["text","voice"].includes(channelType)) throw new Error(`Unknown channel type '${channelType}'`);

		// Create the channel
		const ch = await guild.channels.create(channelName, {
			reason: `Channel created by ${byUserId?byUserId:"an unknown user"}`,
			parent: parentId,
			topic: `Private text channel for ${group.name}, by ${byUserId?byUserId:"an unknown user"}`,
			type: channelType
		});

		// Add to group areas
		let parentArea;
		if (parentId) parentArea = group.areas.find(a => a._id===parentId);
		else parentArea = group.areas[0];

		if (parentArea) {
			parentArea[channelType].push(ch.id);
			await this.updateGroup(group.id, {"areas": group.areas});
		}

		return ch;
	}

	/**
	 * Deletes a channel from this usergroup
	 * @param {String} groupId The ID of the group who's getting a channel deleted
	 * @param {String} channelId The ID of the channel that will be
	 * @param {String} [byUserId] The ID of the user that created the channel
	 * @return {Promise<void>}
	 */
	async deleteChannel(groupId, channelId, byUserId) {
		const group = await this.getGroup(groupId);
		if (!group) return;
		const guild = this.api.bot.guilds.resolve(group.guild);
		if (!guild) return;

		// Try to delete the channel
		let type;
		try {
			const ch = guild.channels.resolve(channelId);
			if (ch) {
				await ch.delete(`Deleted by ${byUserId ? byUserId : "an unknown user"}`)
				type = ch.isText ? "text" : "voice";
			}

		} catch(err){
			if (err.code) {
				switch(err.code) {
					case 50001:
						throw new Error(`Missing permissions to delete the channel.`)
				}
			}
		}

		// Find the parent area of this channel
		let parentArea = group.areas.find(a => {
			if (type) return a[type].includes(channelId);
			else {
				if (a.text.includes(channelId)) {
					type="text";
					return true;
				}
				if (a.voice.includes(channelId)) {
					type="voice";
					return true;
				}
			}
		});

		if (parentArea) {
			// Remove the channel from the area
			parentArea[type].splice(parentArea[type].indexOf(channelId), 1);

			// Save the changes of the area
			await this.updateGroup(group.id, {"areas": group.areas});
		}
	}

	/**
	 * Attempts to remove the Group Guild Role from a user by ID
	 * @param {String|Usergroup} group
	 * @param {String} userId
	 * @param {String} reason
	 * @return {Promise<void>}
	 */
	async removeRole(group, userId, reason) {
		if (!(group instanceof Usergroup)) group = await this.getGroup(group);
		if (!group) return;
		const guild = this.api.bot.guilds.resolve(group.guild);
		if (!guild) return;

		try {
			const member = await guild.members.fetch(userId);
			if (member) await member.roles.remove(group.meta.role_id, reason);
		} catch(_){}
	}

	/**
	 * Attempts to add the Group Guild Role to a user by ID
	 * @param {String|Usergroup} group
	 * @param {String} userId
	 * @param {String} reason
	 * @return {Promise<void>}
	 */
	async addRole(group, userId, reason) {
		if (!(group instanceof Usergroup)) group = await this.getGroup(group);
		if (!group) return;
		const guild = this.api.bot.guilds.resolve(group.guild);
		if (!guild) return;

		try {
			const member = await guild.members.fetch(userId);
			if (member) await member.roles.add(group.meta.role_id, reason);
		} catch(_){}
	}

	/**
	 * Remove a member from the group
	 * @param {String} groupId The ID of the group
	 * @param {String} userId The user that is leaving
	 * @param {String} [reason="Unknown reason"] The reason why the member is being removed
	 * @returns {Promise<void|boolean>}
	 */
	async removeMember(groupId, userId, reason="Unknown reason") {
		const group = await this.getGroup(groupId);
		if (!group) return;
		const guild = this.api.bot.guilds.resolve(group.guild);
		if (!guild) return;

		const groupMember = group.members.get(userId);
		if (!groupMember) return false;

		// Remove guild role
		await this.removeRole(group, userId, reason);

		// Remove from cache and DB
		group.members.delete(userId);
		await this.query.removeMember(group.id, userId);

		return true;
	}

	/**
	 * Retrieve all the groups a user owns in a specific guild
	 * @param {String} guildId The ID of the guild to get groups of
	 * @param {String} userId The target user ID
	 * @returns {Promise<Collection<String, Usergroup>>}
	 */
	async groupsOwnedBy(guildId, userId) {
		const groups = await this.groupsFromGuild(guildId);
		return groups.filter(g => g.owner.id===userId);
	}

	/**
	 * Invites a user to a group
	 * @param {String} groupId The ID of the group
	 * @param {String} userId The user to invite
	 * @param {String} invitedBy The user that invited this user
	 * @param {Boolean} [saveToDB=false] Save the changes to the DB
 	 * @return {Promise<void>}
	 */
	async inviteMember(groupId, userId, invitedBy, saveToDB=false) {
		const group = await this.getGroup(groupId);
		if (!group) return;
		if (group.isInvited(userId)) return;

		group.invited.set(userId, {
			_id: userId,
			createdAt: new Date(),
			by: invitedBy
		});
		// const member = group.makeMember({_id: userId, flags: this.config.flags.onlyInvited});
		// group.members.set(member.id, member);
		// group.changed("members");


		if (saveToDB) await group.save();
	}

	/**
	 * Return a list of groups the user is in
	 * @param {String} userId The ID of the user
	 * @param {String} guildId The ID of the guild
	 * @return {Promise<Array<String>>} An array of group ID's user is in
	 */
	async memberships(userId, guildId) {
		const groups = await this.groupsFromGuild(guildId);
		const g = Array();
		groups.each(group => {
			if (group.isMember(userId)) g.push(group.id);
		});
		return g;
	}

	/**
	 * Creates a new channel for a group and saves it in DB
	 * @param {String} groupId The ID of the group
	 * @param {'text'|'voice'} type The type of channel to create
	 * @param {String} name The name of the new channel
	 * @param {String} [by] The user that created the channel
	 * @return {Promise<TextChannel|VoiceChannel|void>}
	 */
	async createChannel(groupId, type, name, by) {
		const group = await this.getGroup(groupId);
		if (!group) return;
		const guild = this.api.bot.guilds.resolve(group.guild);
		if (!guild) return;

		const categoryId = group.areas[0]._id;

		const channel = await guild.channels.create(name, {
			reason: `Channel for ${group.name} created by ${by}`,
			type: type==="text"?"GUILD_TEXT":"GUILD_VOICE",
			topic: `A ${type} channel for ${group.name}`,
			parent: categoryId,
			// Permissions should be inherited from category
		});

		group.areas[0][type].push(channel.id);
		group.changed("areas");
		await group.save();

		return channel;
	}
}

module.exports = GroupAPI;