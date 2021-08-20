const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "topic",
	desc: "Change the channels topic",
	permission: "group.channel",
	cooldown: 4000,
	options: [{
		type: "CHANNEL",
		name: "channel",
		desc: "The channel to rename",
		required: true
	}, {
		type: "STRING",
		name: "topic",
		desc: "The topic to use on this channel",
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
		if (!payload.can("group.channel.topic"))
			return payload.cant(`You cannot change topic on a channel belonging to **${group.name}**.`);

		// Check new name
		const result = payload.api.groupApi.validate("channel_topic", payload.arg("topic"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Invalid input")
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

		// Set topic
		await channel.setTopic(payload.arg("topic"), `${payload.user.id} changed the topic`);

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Topic set")
					.setColor(group.color(payload.config))
					.setDescription(`Topic of <#${payload.arg("channel")}> was changed.`)
			]
		});
	}
}