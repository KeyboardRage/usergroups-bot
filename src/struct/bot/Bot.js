const fs = require("fs");
const path = require("path");
const { Client } = require("discord.js");

class Bot extends Client {
	constructor(bot_config, djs_config) {
		super(djs_config);

		/**
		 * GraphicDesign bot configurations
		 * @type {Object}
		 */
		this.config = bot_config;
	}

	/**
	 * Sets the Global API circular dependency
	 * @param {GlobalAPI} api
	 */
	setApi(api) {
		this.globalApi = api;
	}

	/**
	 * Sets up the bot events and then callbacks
	 */
	setup() {
		// Set up events
		const events = fs.readdirSync(path.join(__dirname, "/events"));
		events.forEach(eventFile => require(path.join(__dirname, "/events", eventFile))(this.globalApi));
		console.info(`[OK] %s Bot events`, events.length);

		// Set up slash commands
		this.globalApi.cmdApi.loadSlashCommands(this, path.join(__dirname, "../../commands"));
	}

	/**
	 * Starts the bot
	 * @returns {Promise<Bot>}
	 */
	async start() {
		return new Promise(async r => {
			await this.login(process.env.BOT_TOKEN);

			this.on("ready", async () => {
				await this._loadApplication();
				console.info(`[OK] Bot logged in: ${this.user.tag}`);
				return r(this);
			});
		});
	}

	/**
	 * Attempts to load application data, to make slash commands ready for publishing/use
	 * @return {Promise<void>}
	 * @private
	 */
	async _loadApplication() {
		if (!this.application?.owner) await this.application?.fetch();
	}
}

module.exports = Bot;