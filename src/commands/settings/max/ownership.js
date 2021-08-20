const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "ownership",
	desc: "Max amount of users that can be members of a group",
	cooldown: 1000,
	options: [{
		name: "limit",
		desc: "Max number of groups owned allowed",
		type: "INTEGER",
		required: true
	}],
	permission: "settings.max.ownership",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (payload.arg("limit") < 1 || payload.arg("limit") > payload.config.guildApi.config.max.ownership)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid digit")
						.setDescription(`The digit value must be between 1 and ${payload.config.guildApi.config.max.ownership}`)
				]
			});

		payload.config.max_ownership = payload.arg("limit");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit set")
					.setColor("#18cd18")
					.setDescription(`A single user can now only own up to **${payload.config.max_ownership}** groups.`)
			]
		});
	}
}