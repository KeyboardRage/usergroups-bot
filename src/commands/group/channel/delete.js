const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "delete",
	desc: "Permanently delete a group's channel",
	permission: "group.channel",
	cooldown: 4000,
	options: [{
		type: "CHANNEL",
		name: "channel",
		desc: "The channel to delete",
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
		if (!payload.can("group.channel.delete"))
			return payload.cant(`You cannot delete a channel belonging to **${group.name}**.`);

		const channel = payload.guild.channels.resolve(payload.arg("channel"));
		if (!channel) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**Not found:**\
						\nCould not resolve the channel by ID \`${payload.arg("channel")}\`.`)
			]
		});

		// Delete the channel
		try {
			await group.deleteChannel(payload.arg("channel"), payload.user.id);
		} catch(err) {
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Error")
						.setColor("#cd1818")
						.setDescription(err.toString())
				]
			});
		}

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Channel deleted")
					.setColor(group.color(payload.config))
					.setDescription(`Deleted a channel belonging to **${group.name}**.`)
			]
		});
	}
}