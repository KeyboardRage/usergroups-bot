const { User, Guild, GuildMember } = require("discord.js");

/**
 * @prop {GlobalAPI} api The global API
 * @prop {Message} msg The message user sent
 * @prop {GuildConfig} config The guild config
 * @prop {CommandOption|null} options Arguments available
 * @prop {String} cmd The command label
 * @prop {Object} [content={}] The content you will work with when executing a command, which is user-provided content
 */
class SlashPayload {
	/**
	 * Creates a new payload for each message
	 * @see https://www.npmjs.com/package/djs-slash-commands
	 * @param {GlobalAPI} api
	 * @param {Object} interaction
	 * @param {GuildConfig} [config] Only applicable in Guilds
	 * @return {SlashPayload}
	 */
	constructor(api, interaction, config) {
		this.api = api;
		this.int = interaction;
		this.config = config;

		// this.cmdID = this.int.commandID;
		this.cmd = this.int.commandName;
		this.options = this.int.options;
		/**
		 * @type {PermissionTester}
		 */
		this.perms = this._makePermsTester();
	}

	/**
	 * Alias for getting interaction
	 * @return {Object}
	 */
	get interaction() {
		return this.int;
	}

	get channel() {
		return this.int.channel;
	}

	/**
	 * Shortcut for accessing the guild command was used in, if any
	 * @return {Guild|null}
	 */
	get guild() {
		return this.int?.guild ?? null;
	}

	/**
	 * Shortcut for the author of this payload (initiator)
	 * @return {User}
	 */
	get user() {
		return this.int.user;
	}

	/**
	 * Get the member user as member of the guild, if applicable
	 * @return {GuildMember}
	 */
	get member() {
		return this.int?.member ?? null;
	}

	/**
	 * Creates a permission tester
	 * @return {PermissionTester}
	 * @private
	 */
	_makePermsTester() {
		return this.api.permsApi.makeTester(this);
	}

	/**
	 * Get an argument user passed
	 * @param {String} argumentName Name of the argument (an option)
	 * @return {*|null}
	 */
	arg(argumentName) {
		return this.options.get(argumentName)?.value ?? null;
	}

	reply(content) {
		return this.int.reply(content);
	}

	followUp(content) {
		return this.int.followUp(content);
	}

	editReply(content) {
		return this.int.editReply(content);
	}

	deleteReply(options) {
		return this.int.deleteReply(options);
	}

	deferReply(options) {
		return this.int.deferReply(options);
	}

	deferUpdate(options) {
		return this.int.deferUpdate(options);
	}

	/**
	 * Check if a user have permissions or not to do something
	 * @param {String} permissions Permissions user need
	 * @return {Boolean}
	 */
	can(permissions) {
		return this.perms.can(permissions);
	}

	/**
	 * Return a permission denied message object you can pass to payload.reply();
	 * @param {String} [message] An optional custom message for the denied description
	 * @param {Boolean} [send=true] Whether to also handle sending this content
	 * @return {{embeds: MessageEmbed[]}}
	 */
	cant(message, send=true) {
		if (send) return this.reply(this.perms.embed(message));
		return this.perms.embed(message);
	}
}

module.exports = SlashPayload;