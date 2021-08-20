const { MessageEmbed } = require("discord.js");
const CommandGroup = require("./CommandGroup");
const CommandRoot = require("./CommandRoot");
const CommandOption = require("./CommandOption");

class SlashCommand {
	constructor(commandApi, commandData) {
		this.cmdApi = commandApi;

		this.name = commandData.name;
		this.desc = commandData.desc || commandData.description || commandData.name;
		this.cooldown = commandData.cooldown || null;
		this.permission = commandData.permission || this.name;
		this.exec = commandData.exec;
		this.commandId = commandData.commandId || commandData.id;
		this.loadable = commandData.loadable !== undefined ? !!commandData.loadable : true;

		this.options = null;
		if (commandData.options && commandData.options.length) this.options = commandData.options.map(option => new CommandOption(option));

		/**
		 * @abstract
		 * @type {CommandRoot|undefined}
		 * @private
		 */
		this._root = undefined;
		/**
		 * @abstract
		 * @type {CommandGroup|undefined}
		 * @private
		 */
		this._group = undefined;
	}

	/**
	 * Get the unique ID of this command
	 * @return {String}
	 */
	get id() {
		if (this.commandId) return this.commandId;

		let id = String();
		if (this._root) id = `${this._root.name}.`;
		if (this._group) id += `${this._group.name}.`;
		id += this.name;
		return id;
	}

	set group(commandGroup) {
		if (!(commandGroup instanceof CommandGroup))
			throw new TypeError(`Expected CommandGroup instance, got '${commandGroup.constructor.name}'`);
		this._group = commandGroup;
	}
	get group() {
		return this._group;
	}

	set root(commandRoot) {
		if (!(commandRoot instanceof CommandRoot))
			throw new TypeError(`Expected CommandRoot instance, got '${commandRoot.constructor.name}'`);
		this._root = commandRoot;
	}
	get root() {
		return this._root;
	}

	/**
	 * Reload the root of commands this command belong to
	 * @return {*}
	 */
	reload() {
		if (this._root) return this._root.reload();
		else if (this._group) return this._group.reload();
	}

	/**
	 * Run the command
	 * @param {SlashPayload} payload
	 * @return {null|*}
	 */
	run(payload) {
		if (!this.exec) return null;

		// Handle cooldown
		// ... check cooldown
		if (this.cmdApi.cooldown.onCooldown(payload.user.id, this.id))
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Cooldown")
						.setColor("#cd1818")
						.setDescription("You have a command cooldown.\
							\n*Try again in a little bit.*")
				]
			});
		// ... add cooldown
		this.cmdApi.cooldown.add(payload.user.id, this.id, this.cooldown);

		if (!payload.can(this.permission))
			return payload.cant(`You don't have permission to run this command.`);

		return this.exec(payload);
	}

	/**
	 * @param {Boolean} [asString=false] Return the type as a string instead of number
	 * @returns {String|Number}
	 */
	type(asString=false) {
		return asString ? "SUB_COMMAND" : 1;
	}

	toObject() {
		return {
			commandID: this.id,
			type: this.type(),
			name: this.name,
			description: this.desc,
			options: this.options ? this.options.map(o => o.toObject()) : undefined
		}
	}
}

module.exports = SlashCommand;