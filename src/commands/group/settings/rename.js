const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "rename",
	desc: "Rename this or another group",
	permission: "group.settings",
	cooldown: 5000,
	options: [{
		type: "STRING",
		name: "new-name",
		desc: "The new name for the group",
		required: true
	}, {
		type: "STRING",
		name: "old-name",
		desc: "The current name of the group to rename. Default: the group this channel belongs to"
	}],
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("old-name")
		);
		payload.perms.group(group);

		// We don't know which group
		if (!group) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**Not found:**\
					\n${!payload.content["old-name"]
						? "This channel does not belong to a usergroup."
						: `Could not find group by the name **${payload.content["old-name"]}**`}`)
			]
		});

		// Check permission to change settings
		if (!payload.can("group.settings.rename"))
			return payload.cant(`You cannot rename **${group.name}**.`);

		// Check changes
		if (payload.arg("new-name").toLowerCase()===group.name.toLowerCase()) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("No change")
					.setColor("#cd1818")
					.setDescription(`The new and current name is identical`)
			]
		});

		// Validate input
		const result = payload.api.groupApi.validate("name", payload.arg("new-name"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(result.message)
			]
		});

		// Check if taken
		const target = await payload.api.groupApi.groupFromNameAndGuild(
			payload.arg("new-name"),
			payload.guild.id
		);
		if (target) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Taken")
					.setColor("#cd1818")
					.setDescription(`The group name **${payload.arg("new-name")}** is already taken.`)
			]
		});

		// Rename the group
		const oldName = group.name;
		await group.rename(payload.arg("new-name"), true)

		// Try to rename the Discord categories they own
		group.areas.forEach(area => {
			const cat = payload.guild.channels.resolve(area._id);
			try {
				if (cat) cat.setName(payload.arg("new-name"), `Group renamed by ${payload.user.id}`);
			} catch(_){}
		});

		// Try to rename the guild role
		try {
			const role = await payload.guild.roles.fetch(group.meta.role_id, false);
			if (role) await role.setName(payload.arg("new-name"), `Group renamed by ${payload.user.id}`)
		} catch(_) {}

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setDescription(`Renamed group from ${oldName} to **${group.name}**.`)
			]
		});
	}
}