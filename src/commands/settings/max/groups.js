const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "groups",
	desc: "How many groups can exist at the same time",
	cooldown: 1000,
	options: [{
		name: "limit",
		desc: "Max number of groups allowed",
		type: "INTEGER",
		required: true
	}],
	permission: "settings.max.groups",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (payload.arg("limit") < 1 || payload.arg("limit") > payload.aconfig.guildApi.config.max.groups)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid digit")
						.setDescription(`The digit value must be between 1 and ${payload.config.guildApi.config.max.groups}`)
				]
			});

		payload.config.max_groups = payload.arg("limit");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit set")
					.setColor("#18cd18")
					.setDescription(`Server can now only have **${payload.config.max_groups}** groups exist at the same time.`)
			]
		});
	}
}