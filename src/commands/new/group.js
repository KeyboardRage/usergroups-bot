const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "group",
	desc: "Creates a new usergroup",
	cooldown: 5000,
	options: [{
		name: "name",
		desc: "The name of the new group",
		type: "STRING",
		required: true
	},{
		name: "owner",
		desc: "User that will own the group. You if omitted. Disregards ownership count limit",
		type: "USER"
	}],
	permission: "group.new.group",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		// Who will own this group; author or defined user
		let owner = payload.user.id;
		if (payload.arg("owner")) owner = payload.arg("owner");

		// Check if target owns max groups already
		const ownedGroups = await payload.api.groupApi.groupsOwnedBy(payload.guild.id, payload.arg("owner"));
		if (ownedGroups.size >= payload.config.max.ownership) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit reached")
					.setColor("#cd1818")
					.setDescription(`<@${payload.arg("owner")}> already owns max amount of usergroups (*${payload.config.max.ownership}*) possible.`)
			]
		});

		// Validate the name
		const result = payload.api.groupApi.validate("name", payload.arg("name"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`Could not create group:\
					\n${result.message}`)
			]
		});

		if (await payload.api.groupApi.taken(payload.guild.id, payload.arg("name"))) return payload.reply({
			embeds: [
				new MessageEmbed()
				.setColor("#cd1818")
				.setDescription(`Could not create group:\
					\nA group with the name **${payload.arg("name")}** already exist.`)
			]
		});

		// Create group
		const group = payload.api.groupApi.makeGroup({
			name: payload.arg("name"),
			guild: payload.guild.id
		});
		// Create owner
		group.owner = group.makeMember({
			_id: owner,
			flags: group.groupApi.config.memberFlags.founder
		});

		await payload.api.groupApi.setup(group, payload);
		await group.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Created")
					.setColor("#18cd18")
					.setDescription(`Created new usergroup:\
					\n**Name:** ${group.name}\
					\n**Owner:** <@${owner}>`)
			]
		});
	}
}