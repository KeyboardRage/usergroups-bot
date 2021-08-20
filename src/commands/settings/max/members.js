const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "members",
	desc: "Max amount of users that can be members of a group",
	cooldown: 1000,
	options: [{
		name: "limit",
		desc: "Max number of members allowed",
		type: "INTEGER",
		required: true
	}],
	permission: "settings.max.members",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (payload.arg("limit") < 1 || payload.arg("limit") > payload.config.groupApi.config.max.members)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid digit")
						.setDescription(`The digit value must be between 1 and ${payload.config.groupApi.config.max.members}`)
				]
			});

		payload.config.max_members = payload.arg("limit");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit set")
					.setColor("#18cd18")
					.setDescription(`A group can now only have up to **${payload.config.max_members}** members, excluding the owner.`)
			]
		});
	}
}