const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "invite",
	desc: "Invites the user to join or buy-in to the group",
	permission: "group.member",
	cooldown: 1000,
	options: [{
		type: "USER",
		name: "user",
		desc: "The user to invite to the group",
		required: true
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to manage. Default: The group this channel belongs to"
	}],
	async exec(payload) {
		return payload.reply({content: "Currently down for maintenance."});

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

		// Check permission to invite
		if (!payload.can("group.member.invite"))
			return payload.cant(`You don't have permission to invite users to **${group.name}**.`);

		// User is already part of the group
		if (group.isMember(payload.arg("user"))) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Already a member")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("user")}> is already a member of **${group.name}**.`)
			]
		});

		// Invite user to the group
		if (group.isInvited(payload.arg("user"))) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Already invited")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("user")}> is already invited to **${group.name}**.`)
			]
		});

		// Perform invite
		const member = await payload.group.members.fetch(payload.arg("user"));
		if (!member) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Can't find member")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("user")}> could not be fetched. Make sure they're still a member of the server.`)
			]
		});

		// Invites the user
		await group.inviteMember(payload.arg("user"), payload.user.id);
		try {
			await member.send({
				embeds: [
					new MessageEmbed()
						.setTitle("📨 Usergroup invite")
						.setColor(group.color(payload.config))
						.setDescription(`**${group.name}** have invited you to their usergroup!\
						\n${group.invitedBuyInRequired
							? `You have the option to join the group for **¢${group.buyInPrice}**:\n\`/buy buyin ${group.id}\` to pay the entry fee and join.`
							: `You can use \`/groups join ${group.id}\` to join the group.`}`)
				]
			})
		} catch(_) {}

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("User invited")
					.setColor(group.color(payload.config))
					.setDescription(`Invited <@${payload.arg("user")}> to **${group.name}**.\
						\n${group.invitedBuyInRequired
						? `User can join for a **¢${group.buyInPrice}** fee.`
						: `User can choose to join when they want.`}`)
			]
		});
	}
}