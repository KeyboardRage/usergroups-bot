const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "motd",
	desc: "Check the Message of the Day of a usergroup",
	cooldown: 500,
	options: [{
		type: "STRING",
		name: "name",
		desc: "The name of the group to check MoTD of. Default: The group this channel belongs to",
	}],
	permission: "group.me",
	/**
	 * @param {SlashPayload} payload
	 */
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

		if (!payload.can("group.me.motd")) return payload.cant();

		if (!group.isMember(payload.user.id) && !group.isOwner(payload.user.id)) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Not a member")
					.setColor("#cd1818")
					.setDescription(`You are not a member of **${group.name}**`)
			]
		});

		if (!group.motd) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**${group.name}** does not have any MoTD at this moment.`)
			],
			ephemeral: true
		});

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setTitle(`Message of the Day`)
					.setDescription(group.motd)
					.setFooter(group.name)
			],
			ephemeral: true
		});
	}
}