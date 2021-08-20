const { Collection } = require("discord.js");
/**
 * A subcommand group
 * @prop {module:"discord.js".Collection<String, Command>} commands
 */
class CommandGroup {
	constructor(groupData, commands) {
		this.name = groupData.name;
		this.desc = groupData.desc || groupData.description || this.name;

		/**
		 * @type {Collection<String, Command>}
		 */
		this.commands = new Collection();
		if (commands && (commands.length || commands.size)) commands.forEach(cmd => this.commands.set(cmd.name, cmd));

		/**
		 * @abstract
		 * @type {CommandRoot|undefined}
		 * @private
		 */
		this._root = undefined;
	}

	/**
	 * Check if the group command have a command
	 * @param {String} name The command name
	 * @return {boolean}
	 */
	has(name) {
		return this.commands.has(name.toLowerCase());
	}

	/**
	 * @param {Boolean} [asString=false] Return the type as a string instead of number
	 * @returns {String|Number}
	 */
	type(asString=false) {
		return asString ? "SUB_COMMAND_GROUP" : 2;
	}

	addCommand(command) {
		if (command.constructor.name!=="SlashCommand")
			throw new TypeError(`Expected SlashCommand instance, got '${command.constructor.name}'`);

		this.commands.set(command.name, command);
		return this;
	}

	set root(commandRoot) {
		if (commandRoot.constructor.name!=="CommandRoot")
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
		return this._root.reload();
	}

	toObject() {
		const container = {
			type: this.type(),
			name: this.name,
			description: this.desc,
			options: Array()
		};

		this.commands.forEach(cmd => container.options.push(cmd.toObject()));

		return container;
	}
}

module.exports = CommandGroup;