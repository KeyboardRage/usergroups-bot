const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "leave",
	desc: "Leave the usergroup",
	cooldown: 1000,
	options: [{
		type: "STRING",
		name: "name",
		desc: "The name of the group to leave. Default: The group this channel belongs to",
	}],
	permission: "group.me",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		/**
		 * @type {Usergroup}
		 */
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

		// Check is owner
		if (group.isOwner(payload.user.id)) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setTitle("Cannot leave")
					.setDescription(`You are the owner of this group, so you cannot leave it.\
						\nTransfer ownership or terminate the group to leave it.`)
			]
		});

		// Check permissions to leave
		if (!payload.can("group.me.leave"))
			return payload.cant(`You cannot leave this group.`);

		// Isn't member
		if (!group.members.has(payload.user.id)) return payload.user.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Not a member")
					.setColor("#cd1818")
					.setDescription(`You are not a member of **${group.name}**`)
			]
		});

		// Remove user
		await group.removeMember(payload.user.id, "User decided to leave the group");

		return payload.user.send({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setDescription(`You left **${group.name}**`)
			]
		});
	}
}