const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "voice",
	desc: "Creates a new text channel for a group",
	cooldown: 5000,
	options: [{
		name: "name",
		desc: "The name of the new text channel",
		type: "STRING",
		required: true
	}, {
		name: "group-name",
		desc: "The name of the group that will get new channel. Default: the group this channel belongs to",
		type: "STRING"
	}],
	permission: "group.new.channel.voice",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("group-name")
		);
		payload.perms.group(group);

		// Group exist
		if (!group) return payload.reply(
			new MessageEmbed()
				.setColor("#cd1818")
				.setDescription(`**Not found:**\
					\n${!payload.arg("name")
					? "This channel does not belong to a usergroup."
					: `Could not find group by the name **${payload.arg("name")}**`}`)
		);

		if (!payload.can("group.new.channel.voice"))
			return payload.cant(`You don't have permission to create a new voice channel for **${group.name}**.`);

		// Validate input
		const result = payload.api.groupApi.validate("vc-name", payload.arg("name"));
		if (!result.valid) return payload.reply(
			new MessageEmbed()
				.setColor("#cd1818")
				.setDescription(result.message)
		);

		// Check limits not reached
		if (group.voiceChannelCount > payload.api.groupApi.config.max.hardChannelCount) return payload.reply(
			new MessageEmbed()
				.setColor("#cd1818")
				.setTitle("Limit reached")
				.setDescription(`The limit of ${payload.api.groupApi.config.max.hardChannelCount} text channels has been reached.`)
		);

		// Create the channel
		let ch;
		try {
			// Set up parent. Unset if not part of the group.
			let parent = payload.channel.parentId;
			if (!group.areas.find(a=>a._id===parent)) parent = undefined;
			ch = await group.addChannel("voice", payload.arg("name"), parent);
		} catch(err) {
			return payload.reply(
				new MessageEmbed()
					.setTitle("Could not create")
					.setDescription(`Creation of new channel failed:\
						\`\`\`${err.toString()}\`\`\``)
			);
		}

		return payload.reply(
			new MessageEmbed()
				.setTitle("Channel created")
				.setDescription(`A new voice channel was created for **${group.name}**: <#${ch.id}>`)
		);
	}
}