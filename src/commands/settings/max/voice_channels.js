const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "voice-channels",
	desc: "Max voice channels a group may have",
	cooldown: 1000,
	options: [{
		name: "limit",
		desc: "Max number of voice channels",
		type: "INTEGER",
		required: true
	}],
	permission: "settings.max.voice_channel",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (payload.arg("limit") < 1 || payload.arg("limit") > payload.config.guildApi.config.max.voice_channels)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid digit")
						.setDescription(`The digit value must be between 1 and ${payload.config.guildApi.config.max.voice_channels}`)
				]
			});

		payload.config.max_voice_channels = payload.arg("limit");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit set")
					.setColor("#18cd18")
					.setDescription(`A group may now only own up to **${payload.config.max_voice_channels}** voice channels.`)
			]
		});
	}
}