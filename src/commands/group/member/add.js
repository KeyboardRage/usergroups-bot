const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "add",
	desc: "Adds a member to the group",
	permission: "group.member",
	cooldown: 2000,
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

		// Check permission to add
		if (!payload.can("group.member.add"))
			return payload.cant(`You don't have permission to add members to **${group.name}**.`)

		// Check max member count
		if (group.members.size >= payload.config.max.members) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Group limit reached")
					.setColor("#cd1818")
					.setDescription(`**${group.name}** reached the max member cap of ${payload.config.max.members} users.`)
			]
		});
		// Check how many groups user is in
		const groups = await payload.api.groupApi.memberships(payload.arg("user"), payload.guild.id);
		if (groups.length >= payload.config.max.membership) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("User's limit reached")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("user")}> can't join any more groups, they've reached max memberships.`)
			]
		});

		// User is already part of the group
		if (group.isMember(payload.arg("user"))) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Already a member")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("user")}> is already a member of **${group.name}**.`)
			]
		});

		// Add user to the group
		await group.addMember(payload.arg("user"), payload.user.id, true, true);

		// Try to notify the user added
		try {
			const user = await payload.api.bot.users.fetch(payload.arg("user"), {cache: false});
			await user.send({
				embeds: [
					new MessageEmbed()
						.setTitle("📨 Added to usergroup")
						.setColor(group.color(payload.config))
						.setDescription(`**${group.name}** have added you to their usergroup!\
							\nYou can use \`/me leave ${group.name}\` to leave the group.`)
				]
			})
		} catch(_) {}

		// Send confirmation message
		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("User added")
					.setColor(group.color(payload.config))
					.setDescription(`Added <@${payload.arg("user")}> to **${group.name}**.`)
			]
		});
	}
}