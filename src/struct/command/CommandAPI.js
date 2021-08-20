const fs = require("fs");
const path = require("path");
const SlashCommand = require("./SlashCommand");
const CommandRoot = require("./CommandRoot");
const CommandGroup = require("./CommandGroup");
const SlashPayload = require("./SlashPayload");
const { SlashCommandHandler } = require("djs-slash-commands");
const CooldownManager = require("./CooldownManager");

/**
 * @prop {Object} config
 * @prop {Map<String, Command>} cmds
 */
class CommandAPI {
	constructor(cmd_handler_config) {
		/**
		 * @type {Object}
		 */
		this.config = cmd_handler_config;

		/**
		 * Contains slash commands
		 * @type {Map<String, CommandRoot>}
		 */
		this.commands = new Map();

		this.cooldown = new CooldownManager(this.config.cooldownManagerConfig);

		/**
		 * The Slash Commands handler instance.
		 * Requires 'client' instance for construction, so set during bot.setup()
		 * @type {SlashCommandHandler}
		 * @deprecated
		 */
		this.slashCommandsHandler = undefined;
	}

	/**
	 * Sets the Global API circular dependency
	 * @param {GlobalAPI} api
	 */
	setApi(api) {
		this.api = api;
	}

	/**
	 * Check if the root command is a valid one
	 * @param {String} name The command name
	 * @return {boolean}
	 */
	has(name) {
		return this.commands.has(name.toLowerCase());
	}

	/**
	 * Runs Payload, executing the command included
	 * @param {SlashPayload} payload
	 */
	run(payload) {
		if (!payload) throw new Error("Missing Payload");
		if (!(payload instanceof SlashPayload)) throw new TypeError(`Expected Payload or SlashPayload, got '${payload.constructor.name}'`);

		// Get root command if any
		const root = this.commands.get(payload.cmd);

		if (payload.options.getSubcommandGroup(false)) {
			const group = root.groups.get(payload.options.getSubcommandGroup(false));
			const cmd = group.commands.get(payload.options.getSubcommand());

			return cmd.run(payload);
		}

		if (payload.options.getSubcommand()) {
			const cmd = root.commands.get(payload.options.getSubcommand());

			return cmd.run(payload);
		}


		throw new Error(`Unknown intent for payload: ${payload.options.data}`)
	}

	/**
	 * Creates a new Slash Payload instance
	 * @param {Object} interaction
	 * @return {Promise<SlashPayload>}
	 */
	async makePayload(interaction) {
		let guildConfig;

		if (interaction.guildId) {
			guildConfig = await this.api.guildApi.get(interaction.guildId);
			if (!guildConfig) guildConfig = await this.api.guildApi.newGuildConfig(interaction.guildId);
		}

		return new SlashPayload(this.api, interaction, guildConfig);
	}

	/**
	 * Output the commands as JS Object without functions
	 * @return {Object}
	 */
	toObject() {
		const container = Object();

		this.commands.forEach(cmd => {
			container[cmd.name] = cmd.toObject();
		});

		return container;
	}

	/**
	 * Loads all slash commands within the specified folder path
	 * @param {Bot} bot An instance of the bot
	 * @param {String} folderPath Absolute path to the commands folder
	 */
	loadSlashCommands(bot, folderPath) {
		if (!path.isAbsolute(folderPath)) throw new Error(`Folder path must be an absolute path`);
		// this.slashCommandsHandler = new SlashCommandHandler(bot);

		const commandDir = fs.readdirSync(folderPath);
		commandDir.forEach(dir => this._loadFolder(path.join(folderPath, dir)));

		console.info(`[OK] ${this.commands.size} Root commands loaded`);
	}

	/**
	 * Recursively delete a location and all the children it required
	 * @param {String} rootCommandName The name of the root command
	 * @returns {CommandRoot|null}
	 */
	reloadCommand(rootCommandName) {
		if (!this.commands.has(rootCommandName)) throw new Error(`Unknown root command name '${rootCommandName}'`);
		const cmd = this.commands.get(rootCommandName);

		// See all the files in this folder
		const folderContent = fs.readdirSync(cmd.location);

		// Delete require cache based on all the JS files here
		folderContent.forEach(file => {
			if (file.endsWith(".js")) {
				this._recursiveDeleteCache(cmd.location);
			}
		});

		// Now load it again
		this._loadFolder(cmd.location);

		// Return the newly loaded command
		return this.commands.get(rootCommandName);
	}

	/**
	 * Recursively deletes a cache location and all its children
	 * @param {String} location An absolute path to a folder
	 * @param {String} [matchRoot] The root to match. If it doesn't match that, skip loading it. Defaults to initial 'location'
	 * @param {Set<String>} [done] A list of folders loaded. Defaults to creating one on its own.
	 * @private
	 */
	_recursiveDeleteCache(location, matchRoot, done) {
		if (!done) done = new Set();
		if (done.has(location)) return;
		if (!matchRoot) matchRoot = location;
		if (!location.startsWith(matchRoot)) return;

		if (require.cache[require.resolve(location)]?.children?.length) {
			require.cache[require.resolve(location)].children.forEach(child => {
				if (!done.has(child.id) && child.id.startsWith(matchRoot)) {
					this._recursiveDeleteCache(child.id, matchRoot, done);
				}
			});
		} else console.log("No children")

		done.add(location);
		delete require.cache[require.resolve(location)];
	}

	/**
	 * Loads slash command folder
	 * @private
	 */
	_loadFolder(folderPath) {
		if (!path.isAbsolute(folderPath)) throw new Error(`Folder path must be an absolute path`);
		if (this.config.ignoreFolders.includes(path.basename(folderPath))) return;
		const dirContent = fs.readdirSync(folderPath)
			.filter(p => !this.config.ignoreFolders.includes(p));

		// Check root requirements
		let file = "index.js";
		if (!dirContent.includes(file)) file = path.basename(folderPath)+".js";
		if (!dirContent.includes(file)) throw new Error(`Command root is missing index file: '${folderPath}'`);
		dirContent.splice(dirContent.indexOf(file), 1);

		// Create root instance
		const rootData = require(path.join(folderPath, file));
		if ("load" in rootData && !rootData.load) return;
		const root = new CommandRoot(this, {
			name: rootData.name,
			desc: rootData.desc,
			location: folderPath
		});

		// Re-usable function for loading commands and groups
		const load = (file, group) => {
			const cmdData = require(path.join(folderPath, file));
			const cmd = new SlashCommand(this, cmdData);

			if (group) group.addCommand(cmd);
			else root.addCommand(cmd);
		}

		// Load other files/folders
		const files = dirContent.filter(n => n.endsWith(".js"));
		const folders = dirContent.filter(n => !n.includes(".") && !this.config.ignoreFolders.includes(n));

		// Load files
		files.forEach(file => load(file));

		// Load folders with files
		folders.forEach(folder => {
			const dir = fs.readdirSync(path.join(folderPath, folder))
				.filter(p => !this.config.ignoreFolders.includes(p));

			// Check requirements
			let file = "index.js";
			if (!dir.includes(file)) file = folder+".js";
			if (!dir.includes(file)) throw new Error(`Command group is missing index file: '${path.join(folderPath, folder)}'`);
			dir.splice(dir.indexOf(file), 1);

			// Create group instance
			const groupData = require(path.join(folderPath, folder));
			if ("load" in groupData && !groupData.load) return;
			const group = new CommandGroup(groupData);
			root.addGroup(group);

			// Load commands into group
			dir.forEach(file => load(`${folder}/${file}`, group));
		});

		this.commands.set(root.name, root);
	}

	/**
	 * Pushes all loaded commands to Discord
	 * @param {String} [guildId] Specific guild to push to, if omitted, pushes globally
	 * @return {Promise<Collection<Snowflake, ApplicationCommand>>}
	 */
	async bulkPush(guildId) {
		const commands = Array();
		this.commands.forEach(cmd => commands.push(cmd.toObject()));
		fs.writeFileSync("./cmdData.json", JSON.stringify(commands, null, 4));
		// return this.slashCommandsHandler.bulkAdd(commands, guildId);
		const guild = await this.api.bot.guilds.resolve(guildId);
		if (!guild) throw new Error(`Could not resolve guild by ID '${guildId}'`);
		return guild.commands.set(commands);
	}

	/**
	 * Registers a single command to Discord
	 * @param {String} guildId ID of the guild to publish it to
	 * @param {String} commandName The name of the root command to push
	 * @return {Promise<ApplicationCommandType>}
	 */
	async commandPush(guildId, commandName) {
		const cmd = this.commands.get(commandName);
		if (!cmd) throw new Error(`Unknown command '${commandName}'`);

		const guild = await this.api.bot.guilds.resolve(guildId);
		if (!guild) throw new Error(`Could not resolve guild by ID '${guildId}'`);
		return guild.commands.create(cmd.toObject());
	}
}

module.exports = CommandAPI;