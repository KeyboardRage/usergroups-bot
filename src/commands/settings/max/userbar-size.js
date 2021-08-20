const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "userbar-size",
	desc: "The dimension requirements for userbars",
	cooldown: 1000,
	options: [{
		name: "width",
		desc: "The width limitation, in pixels",
		type: "INTEGER",
		required: true
	}, {
		name: "height",
		desc: "The height limitation, in pixels",
		type: "INTEGER",
		required: true
	}],
	permission: "settings.max.userbar_size",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (payload.arg("width") < 1 || payload.arg("width") > payload.config.guildApi.config.userbar.w)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid width")
						.setDescription(`The width must be between 1 and ${payload.config.guildApi.config.userbar.w}`)
				]
			});
		if (payload.arg("height") < 1 || payload.arg("height") > payload.config.guildApi.config.userbar.h)
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setColor("#cd1818")
						.setTitle("Invalid height")
						.setDescription(`The height must be between 1 and ${payload.config.guildApi.config.userbar.h}`)
				]
			});

		payload.config.userbar.w = payload.arg("width");
		payload.config.userbar.h = payload.arg("height");
		payload.config.changed("userbar");
		await payload.config.save();

		let limitation;
		if (payload.config.userbar.exact) {
			limitation = `A userbar must now be ***exactly*** **${payload.config.userbar.w} × ${payload.config.userbar.h} px**.`;
			limitation += `\n\nTurn off **exact** requirement with \`/settings set userbar-size Max\``;
		} else {
			limitation = `A userbar can now be ***up to*** **${payload.config.userbar.w} × ${payload.config.userbar.h} px**.`;
			limitation += `\n\nMake userbars require to fit **exactly** this dimension using \`/settings set userbar-size Exact\``;
		}

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Limit set")
					.setColor("#18cd18")
					.setDescription(limitation)
			]
		});
	}
}