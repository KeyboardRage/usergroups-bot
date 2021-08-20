const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "kick",
	desc: "Kick a usergroup out of the group",
	permission: "group.member",
	cooldown: 2000,
	options: [{
		type: "USER",
		name: "user",
		desc: "The user to kick out of the group",
		required: true
	}, {
		type: "STRING",
		name: "reason",
		desc: "The reason why this user is being kicked"
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to manage. Default: The group this channel belongs to"
	}],
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

		// Check permission to kick
		if (!payload.can("group.member.kick"))
			return payload.cant(`You don't have permission to kick members from **${group.name}**.`);

		if (!group.isMember(payload.arg("user"))) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Not a member")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("user")}> is not a member of **${group.name}**.`)
			]
		});

		// Remove the member from the group
		await group.removeMember(payload.arg("user"), payload.arg("reason"));

		// Notify the user
		const member = await payload.guild.members.fetch(payload.arg("user"));
		try {
			await member.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Removed from group")
						.setColor(group.color(payload.config))
						.setDescription(`You have been removed from **${group.name}**.${
							!payload.arg("reason") ? ""
								: `\n**Reason:**\n${payload.arg("reason")}`}`)
				]
			});
		} catch(_) {}

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setTitle("Member kicked")
					.setDescription(`<@${payload.arg("user")}> has been kicked from the usergroup.`)
			]
		});
	}
}