const { MessageEmbed } = require("discord.js");
// const { MessageButton, MessageActionRow } = require("discord-buttons");

module.exports = {
	name: "new",
	desc: "Create a new text or voice channel",
	permission: "group.channel",
	cooldown: 5000,
	options: [{
		type: "STRING",
		name: "type",
		desc: "The type of channel to create",
		choices: [{
			name: "text",
			value: "text"
		}, {
			name: "voice",
			value: "voice"
		}],
		required: true
	}, {
		type: "STRING",
		name: "channel-name",
		desc: "The name of the new channel",
		required: true
	}, {
		type: "STRING",
		name: "group-name",
		desc: "The name of the group to terminate. Default: the group this channel belongs to"
	}],
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("group-name")
		);
		payload.perms.group(group);

		// We don't know which group
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
		if (!payload.can("group.channel.new"))
			return payload.cant(`You cannot create a text channel for **${group.name}**.`);

		// check limit reached
		if (group.channelTextCount >= payload.config.max[`${payload.arg("type")}_channels`])
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Limit reached")
						.setColor("#cd1818")
						.setDescription(`This usergroup have already maxed out the number of ${payload.arg("type")} channels a group can have.`)
				]
			});

		// Validate channel name
		const result = payload.api.groupApi.validate(
			payload.arg("type")==="text"?"tc-name":"vc-name",
			payload.arg("channel-name")
		);
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Invalid name")
					.setColor("#cd1818")
					.setDescription(result.message)
			]
		});

		// Create a new channel
		const channel = await group.createChannel(
			payload.arg("type"),
			payload.arg("channel-name"),
			payload.user.id
		);

		// Send success message
		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Channel created")
					.setColor(group.color(payload.config))
					.setDescription(`Created new ${payload.arg("type")} channel <#${channel.id}>`)
					.setFooter(group.name)
			]
		});
	}
}