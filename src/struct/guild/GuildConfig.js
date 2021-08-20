class GuildConfig {
	constructor(guildConfigApi, configData) {
		this.guildApi = guildConfigApi;

		this._id = configData._id;
		this.flags = configData.flags || this.guildApi.config.flags;
		this.color = configData.color || this.guildApi.config.color;

		// Max/limits config
		this.max = {
			groups: configData.max?.groups ?? this.guildApi.config.max.ownership,
			membership: configData.max?.membership ?? this.guildApi.config.max.membership,
			ownership: configData.max?.ownership ?? this.guildApi.config.max.ownership,
			text_channels: configData.max?.text_channels ?? this.guildApi.config.max.text_channels,
			voice_channels: configData.max?.voice_channels ?? this.guildApi.config.max.voice_channels,
			members: configData.max?.members ?? this.guildApi.config.max.members,
		}

		// Userbar config
		this.userbar = {
			w: configData.userbar?.w ?? this.guildApi.config.userbar.w,
			h: configData.userbar?.h ?? this.guildApi.config.userbar.h,
			exact: configData.userbar?.exact ?? this.guildApi.config.exact,
			ext: configData.userbar?.ext ?? this.guildApi.config.userbar.ext,
		};

		// Various prefixes
		this.prefix = {
			category: configData.prefix?.category !== undefined ? configData.prefix.category : this.guildApi.config.prefix.category,
			role: configData.prefix?.role !== undefined ? configData.prefix?.role : this.guildApi.config.prefix.role,
		};

		/**
		 * Set of changes for minimal update queries
		 * @type {Set<String>}
		 * @private
		 */
		this._changed = new Set();
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
	 * Get the guild's ID
	 * @return {String}
	 */
	get id() {
		return this._id;
	}

	/**
	 * Get how many groups guild can have
	 * @return {Number}
	 */
	get max_groups() {
		return this.max.groups;
	}
	/**
	 * Set max groups guild can have
	 * @param {Number} number
	 */
	set max_groups(number) {
		if (typeof(number)!=="number") throw new TypeError(`Expected Number, got '${number.constructor.name}'`);
		if (this.max.groups === parseInt(number)) return;
		this.max.groups = parseInt(number);
		this.changed("max");
	}

	/**
	 * Get how many groups guild can have
	 * @return {Number}
	 */
	get max_ownership() {
		return this.max.ownership;
	}
	/**
	 * Set max groups guild can have
	 * @param {Number} number
	 */
	set max_ownership(number) {
		if (typeof(number)!=="number") throw new TypeError(`Expected Number, got '${number.constructor.name}'`);
		if (this.max.ownership === parseInt(number)) return;
		this.max.ownership = parseInt(number);
		this.changed("max");
	}

	/**
	 * Get how many groups a member can be member of
	 * @return {Number}
	 */
	get max_membership() {
		return this.max.membership;
	}
	/**
	 * Set max groups member can be part of
	 * @param {Number} number
	 */
	set max_membership(number) {
		if (typeof(number)!=="number") throw new TypeError(`Expected Number, got '${number.constructor.name}'`);
		if (this.max.membership === parseInt(number)) return;
		this.max.membership = parseInt(number);
		this.changed("max");
	}

	/**
	 * Get how many text channels a group can have
	 * @return {Number}
	 */
	get max_text_channels() {
		return this.max.text_channels;
	}
	/**
	 * Set max text channels a group can have
	 * @param {Number} number
	 */
	set max_text_channels(number) {
		if (typeof(number)!=="number") throw new TypeError(`Expected Number, got '${number.constructor.name}'`);
		if (this.max.text_channels === parseInt(number)) return;
		this.max.text_channels = parseInt(number);
		this.changed("max");
	}

	/**
	 * Get how voice channels a group can have
	 * @return {Number}
	 */
	get max_voice_channels() {
		return this.max.voice_channels;
	}
	/**
	 * Set max voice channels a group can have
	 * @param {Number} number
	 */
	set max_voice_channels(number) {
		if (typeof(number)!=="number") throw new TypeError(`Expected Number, got '${number.constructor.name}'`);
		if (this.max.voice_channels === parseInt(number)) return;
		this.max.voice_channels = parseInt(number);
		this.changed("max");
	}

	/**
	 * Get how many members a group can have
	 * @return {Number}
	 */
	get max_members() {
		return this.max.members;
	}
	/**
	 * Set max members a group can have
	 * @param {Number} number
	 */
	set max_members(number) {
		if (typeof(number)!=="number") throw new TypeError(`Expected Number, got '${number.constructor.name}'`);
		if (this.max.members === parseInt(number)) return;
		this.max.members = parseInt(number);
		this.changed("max");
	}

	/**
	 * Get prefix for categories
	 * @return {String}
	 */
	get prefix_category() {
		return this.prefix.category;
	}
	/**
	 * Set max voice channels a group can have
	 * @param {String} prefix
	 */
	set prefix_category(prefix) {
		if (typeof(prefix)!=="string" && prefix!==null) throw new TypeError(`Expected String, got '${prefix.constructor.name}'`);

		// Prefix may be null to not use any
		if (prefix) prefix = prefix.toUpperCase();
		if (this.prefix.category === prefix) return;

		this.prefix.category = prefix;
		this.changed("prefix");
	}

	/**
	 * Get prefix for categories
	 * @return {String}
	 */
	get prefix_role() {
		return this.prefix.role;
	}
	/**
	 * Set max voice channels a group can have
	 * @param {String} prefix
	 */
	set prefix_role(prefix) {
		if (typeof(prefix)!=="string" && prefix!==null) throw new TypeError(`Expected String, got '${prefix.constructor.name}'`);

		// Prefix may be null to not use any
		if (prefix) prefix = prefix.toUpperCase();
		if (this.prefix.role === prefix) return;

		this.prefix.role = prefix;
		this.changed("prefix");
	}

	/**
	 * Check if transferring ownership is allowed or not
	 * @return {boolean}
	 */
	get transfer() {
		return !!(this.flags & this.guildApi.config.flag.transfer);
	}
	/**
	 * Set if transfer is allowed or not
	 * @param {Boolean} boolean
	 */
	set transfer(boolean) {
		if (!!boolean) {
			if (this.transfer) return;
			this.flags |= this.guildApi.config.flag.transfer;
			this.changed("flags");
		} else {
			if (!this.transfer) return;
			this.flags = this.flags & ~this.guildApi.config.flag.transfer;
			this.changed("flags");
		}
	}

	/**
	 * Check if groups can set custom color or not
	 * @return {boolean}
	 */
	get custom_color() {
		return !!(this.flags & this.guildApi.config.flag.custom_color);
	}
	/**
	 * Set if custom colors are permitted or not
	 * @param {Boolean} boolean
	 */
	set custom_color(boolean) {
		if (!!boolean) {
			if (this.custom_color) return;
			this.flags |= this.guildApi.config.flag.custom_color;
			this.changed("flags");
		} else {
			if (!this.custom_color) return;
			this.flags = this.flags & ~this.guildApi.config.flag.custom_color;
			this.changed("flags");
		}
	}

	/**
	 * Saves the current state of the Usergroup, or saves new document if ID is not populated
	 * @return {Promise<GuildConfig>}
	 */
	async save() {
		// If ID is not populated, we assume it's not inserted yet
		if (!this._id) {
			this._id = this.guildApi.api.mongo.newId;
			await this.guildApi.insert(this);
		}
		// If there is ID, we assume it's from DB or at least in DB, so only update tracked changes
		else {
			if (!this._changed.size) return null;

			const newData = this.toObject();
			delete newData._id;
			for (const key in newData) if (!this._changed.has(key)) delete newData[key];
			this._changed = new Set(); // Reset tracked changes

			await this.guildApi.updateGuild(this._id, newData);
		}

		return this;
	}

	/**
	 * Converts the GuildConfig to a plain object
	 * @return {{userbar: (*|{ext: (*|[StringConstructor]), w: (*|number|{default: number, type: Number | NumberConstructor, required: boolean}), h: (number|*|{default: number, type: Number | NumberConstructor, required: boolean}|{default: number, type: Number | NumberConstructor, required: boolean})}), color: *, max: (*|{ownership: (number|*), voice_channels: (number|*), members: *, groups: (Collection<String, Usergroup>|number|{[p: string]: string}|*), text_channels: (number|*)}), prefix: (*|{role: (*|string|{default: string, type: String | StringConstructor, required: boolean}), category: (string|*|{default: string, type: String | StringConstructor, required: boolean})}), flags: *, _id}}
	 */
	toObject() {
		return {
			_id: this._id,
			flags: this.flags,
			color: this.color,
			max: this.max,
			prefix: this.prefix,
			userbar: this.userbar
		};
	}
}

module.exports = GuildConfig;