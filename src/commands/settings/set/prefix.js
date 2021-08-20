const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "prefix",
	desc: "Check or set a prefix for groups",
	cooldown: 1000,
	options: [{
		name: "location",
		desc: "The location of the prefix",
		required: true,
		type: "INTEGER",
		choices: [{
			name: "category",
			value: 1
		}, {
			name: "role",
			value: 2
		}]
	}, {
		name: "prefix",
		desc: "The prefix to use, or 'none' for no prefix",
		type: "STRING"
	}],
	permission: "settings.set.prefix",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		let string, prefix;

		if (payload.arg("prefix")) {
			prefix = payload.arg("prefix").toLowerCase() === "none"
				? null : payload.arg("prefix").toUpperCase();
		}

		switch(payload.arg("location")) {
			case 1: {
				if (payload.arg("prefix")) payload.config.prefix_category = prefix;
				string = `**Prefix:** ${payload.config.prefix.category?payload.config.prefix.category:"`NO PREFIX`"}\
						\n**Location:** Channel Category`;
				break;
			}
			case 2: {
				if (payload.arg("prefix")) payload.config.prefix_role = prefix;
				string = `**Prefix:** ${payload.config.prefix.role?payload.config.prefix.role:"`NO PREFIX`"}\
						\n**Location:** Group server roles`;
				break;
			}
			default:
				throw new Error(`Unknown location of prefix '${payload.arg("location")}'`);
		}

		if (payload.arg("prefix")) await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle(payload.arg("prefix") ? "Saved prefix" : "Prefix settings")
					.setColor("#18dc18")
					.setDescription(`A prefix prepends an optional custom string before the group's name.\
						\n${payload.arg("prefix") ? `**Saved setting:**`:""}\n${string}`)
			]
		});
	}
}