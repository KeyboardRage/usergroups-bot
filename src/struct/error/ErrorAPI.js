const { MessageEmbed, TextChannel } = require("discord.js");

class ErrorAPI {
	constructor(errorApiConfig) {
		this.config = errorApiConfig;
		/**
		 * @abstract
		 * @type {GlobalAPI}
		 */
		this.api = undefined;
	}

	/**
	 * Sets the API for circular dependency
	 * @param {GlobalAPI} api
	 */
	setApi(api) {
		this.api = api;
	}

	/**
	 * Return the channel alerts should be sent to
	 * @return {TextChannel}
	 */
	get alertChannel() {
		const guild = this.api.bot.guilds.resolve(this.config.alert.guild);
		if (!guild) throw new Error(`Could not resolve guild to alert errors to '${this.config.alert.guild}'`);
		return guild.channels.resolve(this.config.alert.channel);
	}


	/**
	 * Returns the current date as a readable string
	 * @return {String} E.g. `Mon, 14 Jun 2021 14:11:42 GMT`
	 */
	get date() {
		return new Date().toUTCString();
	}

	/**
	 * Registers the error handlers
	 */
	loadHandlers() {
		require("./processErrorHandlers")(this.api);
	}

	/**
	 * Creates a new alert in the GD guild about an error
	 * @param {Error|TypeError} error The error being captured
	 * @param {String} [errorIdentifier] An optional identifier for the error, so it can be traced back easily
	 * @return {Promise<String>} The ErrorIdentifier. Either the one passed, or a random string generated.
	 */
	async alert(error, errorIdentifier) {
		let random = Math.random().toString(36).substr(2, 5);

		if (!errorIdentifier) errorIdentifier = random;
		else errorIdentifier += "."+random;

		console.error(`[${this.date} / ${errorIdentifier}]`, error);
		try {
			await this.alertChannel.send({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle(`Error captured`)
						.setFooter(`Error ID: ${errorIdentifier}`)
						.setDescription(`\`\`\`${error.toString()}\`\`\``)
						.setTimestamp(new Date())
				]
			});
		} catch(e) {
			console.error(`Unable to send an alert to the alerting channel.`);
		}

		return errorIdentifier
	}
}

module.exports = ErrorAPI;