const bot_config = {

}

const { Intents } = require("discord.js");

const djs_config = {
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS
	]
}

const mongo_config = {
	uri: "mongodb://localhost:27017/usergroups",
	options: {
		useFindAndModify: true,
		useUnifiedTopology: true,
		useNewUrlParser: true
	}
}

const redis_config = {

}

const cooldownManagerConfig = {
	// If no cooldown is provided, this is used
	fallbackCooldown: 2000,
	// If the cooldown of the command applies to ALL command executions, or the specific one
	userGlobal: false,
}

const cmd_handler_config = {
	cooldownManagerConfig,
	ignoreFolders: [
		"src",
	],

}
const guildFlags = {
	// Transfer of ownership permitted
	transfer:       1<<0,
	// Allow custom colors
	custom_color:   1<<1,
}
const guild_config = {
	max: {
		// Max groups to exist in a guild
		groups: 24,
		ownership: 4,
		membership: 24,
		text_channels: 5,
		voice_channels: 5,
		members: 10,
	},
	prefix: {
		category: "👪-",
		role: "",
	},
	userbar: {
		w: 400, // Max width
		h: 300, // Max height
		exact: false, // Must be EXACTLY w/h
		ext: ["jpg","webp","jpeg","png","gif","apng"] // Valid image types (all)
	},
	flags: guildFlags.transfer|guildFlags.custom_color,
	color: "#EA8B41FF",
	flag: guildFlags
}

const group_config = {
	max: {
		// Max for bot GLOBALLY:
		// If changed, consider group listing embed exceeding 24 fields.
		groups: guild_config.max.groups,
		members: 100,
		text_channels: 30,
		voice_channels: 30,
		ownership: guild_config.max.groups,

		// Other max limits:
		nameLength: 64,
		descLength: 256,
		channelNameLength: 32,
		motdLength: 256,
		hardChannelCount: 20, // Bot-cap for channel counts: Max 20 txt channels, max 20 voice channels
		groupOwnerships: 20, // Bot-cap for group ownerships per user per guild
	},
	regex: {
		name: {
			fn: value => /^[a-zA-Z0-9-_ ]+$/.test(value),
			display: "a-Z0-9, hyphen, underscore"
		}
	},
	flags: {
		applicationsOpen:       1<<0,
		onlyInvited:            1<<0,
		invitedBuyInRequired:   1<<1,
	},
	memberFlags: {
		// This user is the founder of the group
		founder:    1<<0,
	},
	permission: {
		owner: [
			"MANAGE_MESSAGES",
			"SEND_MESSAGES",
			"VIEW_CHANNEL",
			"ATTACH_FILES",
			"EMBED_LINKS",
			"READ_MESSAGE_HISTORY",
			"MUTE_MEMBERS",
			"DEAFEN_MEMBERS",
			"MOVE_MEMBERS",
		],
		grantRole: [
			"SEND_MESSAGES",
			"VIEW_CHANNEL",
			"ATTACH_FILES",
			"EMBED_LINKS",
			"READ_MESSAGE_HISTORY",
			"CONNECT",
			"SPEAK",
		],
		denyRole: [
			"SEND_MESSAGES",
			"VIEW_CHANNEL",
			"READ_MESSAGE_HISTORY",
			"CONNECT",
			"SPEAK"
		],
		bot: [
			"CONNECT",
			"MUTE_MEMBERS",
			"DEAFEN_MEMBERS",
			"MOVE_MEMBERS",
			"MANAGE_MESSAGES",
			"MANAGE_CHANNELS",
			"MANAGE_THREADS",
			"SEND_MESSAGES",
			"VIEW_CHANNEL",
			"ATTACH_FILES",
			"EMBED_LINKS",
			"READ_MESSAGE_HISTORY",
		]
	},
}

const permissionApiConfig = {

}

const button_listener_config = {
	maxExpire: 60*30 // 30 min
}

const errorApiConfig = {
	alert: {
		guild: "873296049391943682",
		channel: "874925365448036394"
	}
}

module.exports = {
	bot_config,
	djs_config,
	mongo_config,
	redis_config,
	cmd_handler_config,
	guild_config,
	group_config,
	permissionApiConfig,
	button_listener_config,
	errorApiConfig,
}