const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "description",
	desc: "Set or see the public description of this group",
	permission: "group.set",
	cooldown: 1000,
	options: [{
		type: "STRING",
		name: "description",
		desc: "The description to be set",
		required: true
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to change. Default: The group this channel belongs to"
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

		if (!payload.can("group.set.desc"))
			return payload.cant(`You don't have permission to change description of **${group.name}**.`);

		// Validate
		const result = payload.api.groupApi.validate("desc", payload.arg("description"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(result.message)
			]
		});

		// Set description
		await group.setDesc(payload.arg("description"), true);

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setDescription(`Changed description of **${group.name}**.`)
			]
		});
	}
}