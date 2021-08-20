const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "rename",
	desc: "Change the name of a channel",
	permission: "group.channel",
	cooldown: 5000,
	options: [{
		type: "CHANNEL",
		name: "channel",
		desc: "The channel to rename",
		required: true
	}, {
		type: "STRING",
		name: "new-name",
		desc: "The new name of the channel",
		required: true
	}],
	async exec(payload) {
		let group = await payload.api.groupApi.getGroupFromChannel(payload.guild.id, payload.arg("channel"));
		payload.perms.group(group);

		// We don't know which group
		if (!group) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**Not found:**\
						\nThis channel does not belong to a usergroup.`)
			]
		});

		// Check if permission to delete
		if (!payload.can("group.channel.rename"))
			return payload.cant(`You cannot rename a channel belonging to **${group.name}**.`);

		// Check new name
		const result = payload.api.groupApi.validate("channel", payload.arg("new-name"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Invalid name")
					.setColor("#cd1818")
					.setDescription(result.message)
			]
		});

		// Rename the channel
		const channel = payload.guild.channels.resolve(payload.arg("channel"));
		if (!channel) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**Not found:**\
						\nCould not resolve the channel by ID \`${payload.arg("channel")}\`.`)
			]
		});

		// Rename
		await channel.setName(payload.arg("new-name"), `${payload.user.id} renamed a channel belonging to ${group.name}`);

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Channel renamed")
					.setColor(group.color(payload.config))
					.setDescription(`Renamed channel, <#${payload.arg("channel")}>`)
			]
		});
	}
}