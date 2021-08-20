const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "color",
	desc: "Set a new theme color for the group",
	permission: "group.set",
	cooldown: 3000,
	options: [{
		type: "STRING",
		name: "color-hex",
		desc: "The hex colour to change to (e.g. #cd18cd)",
		required: true
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to manage. Default: The group this channel belongs to"
	}],
	async exec(payload) {
		if (!payload.config.custom_color) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Cannot change")
					.setColor("#cd1818")
					.setDescription(`Custom colors have been disabled in this server.`)
			]
		});

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

		// Check permission to set color
		if (!payload.can("group.set.color"))
			return payload.cant(`You don't have permission to change theme color of **${group.name}**.`);

		// Validate the MotD content
		const result = payload.api.groupApi.validate("color", payload.arg("color-hex"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(result.message)
			]
		});

		// Set the content and save it
		group.setColor(result.value);
		await group.save();

		// Update role color
		try {
			const role = await payload.guild.roles.fetch(group.meta.role_id);
			if (role) await role.setColor(group.color(payload.config));
		} catch(_){}

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setTitle("Color changed")
					.setDescription(`Color has been set to \`#${group.meta.color.toString(16)}\``)
			]
		});
	}
}