const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "applications",
	desc: "Setting for enabling or disabling applications to this group",
	permission: "group.settings",
	cooldown: 1000,
	options: [{
		type: "BOOLEAN",
		name: "open",
		desc: "Open applications to outsiders",
		required: true
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to manage. Default: The group this channel belongs to"
	}],
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload, payload.arg("name")
		);
		payload.perms.group(group);

		// Group exist
		if (!group) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**Not found:**\
					\n${!payload.arg("name")
						? "This channel does not belong to a usergroup."
						: `Could not find group by the name **${payload.arg("name")}**`}`)
			]
		});

		// Check permission to change settings
		if (!payload.can("group.settings.applications"))
			return payload.cant(`You cannot change settings of **${group.name}**.`);

		// Change settings
		group.applicationsOpen = payload.get("open");
		await group.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Settings saved")
					.setColor(group.color(payload.config))
					.setDescription(`Applications are **${group.applicationsOpen ? "open" : "closed"}**.`)
			]
		});
	}
}