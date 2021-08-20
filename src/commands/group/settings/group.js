const { MessageEmbed } = require("discord.js");
// const { MessageButton, MessageActionRow } = require("discord-buttons");

module.exports = {
	name: "terminate",
	desc: "Permanently terminates a group",
	permission: "group.delete",
	options: [{
		type: "STRING",
		name: "name",
		desc: "The name of the group to terminate. Default: the group this channel belongs to"
	}],
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("name")
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
		if (!payload.can("group.delete.group"))
			return payload.cant(`You cannot terminate **${group.name}** because you don't own it.`);

		await group.delete(payload.user.id);
		// Try send in channel
		try {
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Terminated")
						.setDescription(`The group **${group.name}** was permanently deleted.\
							\nAll channels and categories were deleted.`)
				]
			});
		} catch(_){
			// If failed, try send in DM
			try {
				payload.member.send({
					embeds: [
						new MessageEmbed()
							.setColor("#cd1818")
							.setTitle("Terminated")
							.setDescription(`The group **${group.name}** was permanently deleted.\
							\nAll channels and categories were deleted.`)
					]
				})
			} catch(_){}
		}

		// Set up button listener
		// const listenerId = payload.api.buttonListener.genId();
		// payload.api.buttonListener.add((api,ctx) => {
		// 	if (ctx)
		// }, 60);

		// Set up button
		/*const button = new MessageButton()
			.setLabel("🗑 Terminate")
			.setID(listenerId)
			.setStyle("red");
		const row = new MessageActionRow()
			.addComponent(button);

		// Ask for confirmation
		const collected = await payload.reply({
			embed: new MessageEmbed()
				.setTitle("Confirmation")
				.setDescription(`You are about to permanently delete this group.\
					\nAll associated content will be purged:\
					\n• category section deleted\
					\n• channels deleted\
					\n• server role deleted\
					\n• database records deleted`),
			components: [row.toJSON()]
		}).awaitButtons(a => a.author.id===payload.user.id);

		console.log(collected);
		return null;*/
	}
}