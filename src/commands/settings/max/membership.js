const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "memberships",
	desc: "Max groups a single member can be part of",
	cooldown: 1000,
	options: [{
		name: "limit",
		desc: "Number of groups user can be part of",
		type: "INTEGER",
		required: true
	}],
	permission: "settings.max.membership",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (payload.arg("limit") < 1 || payload.arg("limit") > payload.config.guildApi.config.max.membership)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid digit")
						.setDescription(`The digit value must be between 1 and ${payload.config.guildApi.config.max.membership}`)
				]
			});

		payload.config.max_membership = payload.arg("limit");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit set")
					.setColor("#18cd18")
					.setDescription(`A user can now only be member of up to **${payload.config.max_membership}** groups, excluding groups they own.`)
			]
		});
	}
}