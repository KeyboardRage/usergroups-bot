const { Collection } = require("discord.js");

class CommandRoot {
	constructor(commandApi, rootData) {
		this.cmdApi = commandApi;

		this.name = rootData.name;
		this.desc = rootData.desc || rootData.description || this.name;
		this.location = rootData.location;

		this.groups = new Collection();
		this.commands = new Collection();
	}

	/**
	 * Check if the root command have a command group or subcommand
	 * @param {String} name The command or group name
	 * @return {boolean}
	 */
	has(name) {
		return this.groups.has(name.toLowerCase()) ? true : this.commands.has(name.toLowerCase());
	}

	addGroup(commandGroup) {
		if (commandGroup.constructor.name!=="CommandGroup")
			throw new TypeError(`Expected CommandGroup instance, got '${commandGroup.constructor.name}'`);

		this.groups.set(commandGroup.name, commandGroup);
		commandGroup.root = this;
		return this;
	}

	addCommand(command) {
		if (command.constructor.name!=="SlashCommand")
			throw new TypeError(`Expected Subcommand instance, got '${command.constructor.name}'`);

		this.commands.set(command.name, command);
		command.root = this;
		return this;
	}

	/**
	 * Reloads the command and all sub-commands
	 */
	reload() {
		return this.cmdApi.reloadCommand(this.name);
	}

	toObject() {
		const container = {
			name: this.name,
			description: this.desc,
			options: Array()
		}

		this.groups.forEach(group => container.options.push(group.toObject()));
		this.commands.forEach(cmd => container.options.push(cmd.toObject()));

		return container;
	}
}

module.exports = CommandRoot;