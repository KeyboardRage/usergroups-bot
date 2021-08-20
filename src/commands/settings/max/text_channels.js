const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "text-channels",
	desc: "Max text channels a group may have",
	cooldown: 1000,
	options: [{
		name: "limit",
		desc: "Max number of text channels",
		type: "INTEGER",
		required: true
	}],
	permission: "settings.max.text_channel",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (payload.arg("limit") < 1 || payload.arg("limit") > payload.config.guildApi.config.max.text_channels)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid digit")
						.setDescription(`The digit value must be between 1 and ${payload.config.guildApi.config.max.text_channels}`)
				]
			});

		payload.config.max_text_channels = payload.arg("limit");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit set")
					.setColor("#18cd18")
					.setDescription(`A group may now only own up to **${payload.config.max_text_channels}** text channels.`)
			]
		});
	}
}