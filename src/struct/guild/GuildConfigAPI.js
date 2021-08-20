const GuildConfig = require("./GuildConfig");

/**
 * @prop {Object} config
 * @prop {Map<String, GuildConfig>} guilds
 */
class GuildConfigAPI {
	constructor(guild_config) {
		this.config = guild_config;
		this.guilds = new Map();
	}

	/**
	 * Sets the Global API circular dependency
	 * @param {GlobalAPI} api
	 */
	setApi(api) {
		this.api = api;

		this.query = new Proxy(this.api.mongo.query, {
			get(target, prop) {
				return target.guildConfig[prop];
			}
		});
	}

	/**
	 * Retrieves a guild config from cache or DB then caches it
	 * @param {String} guildId
	 * @return {Promise<GuildConfig|null>}
	 */
	async get(guildId) {
		if (this.guilds.has(guildId)) return this.guilds.get(guildId);

		const configData = await this.api.mongo.query.guildConfig.fetchConfig(guildId);
		if (!configData) return null;

		const config = this.makeConfig(configData);
		this.guilds.set(config.id, config);
		return config;
	}

	/**
	 * Creates a brand new guild config based on the guild ID
	 * @param {String} guildId
	 * @return {Promise<GuildConfig>}
	 */
	async newGuildConfig(guildId) {
		// const guild = await this.api.bot.guilds.fetch(guildId);
		const config = this.makeConfig({_id: guildId});

		// Insert into DB and cache
		this.guilds.set(config.id, config);
		await this.api.mongo.query.guildConfig.insertConfig(config.toObject());

		return config;
	}

	/**
	 * Creates a new GuildConfig instance
	 * @param {Object} configData
	 * @return {GuildConfig}
	 */
	makeConfig(configData) {
		return new GuildConfig(this, configData);
	}

	/**
	 * Updates a guild config with new data
	 * @param {String} guildId ID of the guild
	 * @param {Object} newData The new data to be set
	 * @return {Promise<Object>}
	 */
	async updateGuild(guildId, newData) {
		return this.query.updateData(guildId, newData);
	}
}

module.exports = GuildConfigAPI;