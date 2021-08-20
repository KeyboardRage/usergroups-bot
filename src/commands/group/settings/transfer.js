const { MessageEmbed } = require("discord.js");
const fn = require("./src/transfer_snippets");

module.exports = {
	name: "transfer",
	desc: "Transfer ownership of the usergroup to another user",
	permission: "group.settings",
	cooldown: 5000,
	options: [{
		type: "USER",
		name: "new-owner",
		desc: "The user that will receive ownership of the usergroup",
		required: true
	}, {
		type: "BOOLEAN",
		name: "stay",
		desc: "Stay as a member of the group, or leave after transfer",
		required: true
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to transfer. Default: The group this channel belongs to"
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

		// Check if owner/permission
		if (!payload.can("group.settings.transfer"))
			return payload.cant(`You cannot transfer ownership of **${group.name}**.`);

		// Check if user
		if (group.owner.id === payload.arg("new-owner")) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("No change")
					.setColor("#cd1818")
					.setDescription(`Cannot transfer ownership of **${group.owner.id}** to yourself.`)
			]
		});
		// Check if bot
		const ownerUser = await payload.api.bot.users.fetch(payload.arg("new-owner"));
		if (!ownerUser) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Not found")
					.setColor("#cd1818")
					.setDescription(`Could not find user \`${payload.arg("new-owner")}\` in Discord.`)
			]
		});
		if (ownerUser.bot) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Cannot transfer")
					.setColor("#cd1818")
					.setDescription(`Bots cannot be owners of usergroups`)
			]
		});

		// Check if target owns max groups already
		const ownedGroups = await payload.api.groupApi.groupsOwnedBy(payload.guild.id, payload.arg("new-owner"));
		if (ownedGroups.size >= payload.config.max.ownership) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit reached")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("new-owner")}> already owns max amount of usergroups (*${payload.config.max.ownership}*) possible.`)
			]
		});

		// Whether to stay in the group or not as a member
		await fn.moveOldOwner(payload, group);

		// Move from membership status to owner in cache, if user was owner
		await fn.moveNewOwner(payload, group);

		// Update the category permissions
		await fn.updateChannelPermissions(payload, group);

		// Save the changes
		await group.save();

		const embed = new MessageEmbed()
			.setColor(group.color(payload.config))
			.setDescription(`Ownership of **${group.name}** was transferred to <@${group.owner.id}>.`);

		if (payload.arg("stay")) return payload.reply({embeds: [embed]});
		await payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Ownership transferred")
					.setColor(group.color(payload.config))
					.setDescription(`<@${payload.user.id}> transferred ownership to <@${group.owner.id}> and left the group.`)
			]
		});

		try {
			return payload.member.send({embeds: [embed]});
		} catch(_){}
	}
}