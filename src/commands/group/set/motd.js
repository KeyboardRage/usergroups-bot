const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "motd",
	desc: "Set a new MOTD for the group",
	permission: "group.set",
	cooldown: 1000,
	options: [{
		type: "STRING",
		name: "motd",
		desc: "The new Message of the Day",
		required: true
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to manage. Default: The group this channel belongs to"
	}],
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("name")
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

		// Check permission to delete
		if (!payload.can("group.set.motd"))
			return payload.cant(`You don't have permission to set Message of the Day for **${group.name}**.`);

		// Validate the MotD content
		const result = payload.api.groupApi.validate("motd", payload.arg("motd"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(result.message)
			]
		});

		// Set the content and save it
		group.motd = payload.arg("motd");
		await group.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setTitle("Message of the Day set")
					.setDescription(payload.arg("motd"))
					.setFooter(group.name)
			]
		});
	}
}