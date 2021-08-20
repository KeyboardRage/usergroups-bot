const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "members",
	desc: "List all members of a group",
	cooldown: 1000,
	options: [{
		type: "STRING",
		name: "name",
		desc: "The name of the group to get members of. Default: The group this channel belongs to",
	}],
	permission: "group.list.members",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("name")
		);

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

		let memberList = `**Owner** <@${group.owner.id}>\n`;
		group.members.forEach(groupMember => {
			if (groupMember.id !== group.owner.id) memberList += `\n<@${groupMember.id}>`
		});

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle(`Members of ${group.name}`)
					.setColor(group.color(payload.config))
					.setDescription(memberList)
			]
		});
	}
}