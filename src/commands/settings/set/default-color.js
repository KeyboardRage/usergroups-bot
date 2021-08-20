const Color = require("../../../struct/tools/Color");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "default-color",
	desc: "Check or set the default color of new groups",
	cooldown: 1000,
	options: [{
		name: "color",
		desc: "A HEX color, e.g. '#18cd18'",
		type: "STRING",
	}],
	permission: "settings.set.default_color",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (!payload.arg("color")) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(payload.config.color)
					.setTitle("Default color")
					.setDescription(`All new usergroups will by default have the HEX color \`#${payload.config.color.toString(16)}\``)
			]
		});

		const result = Color.validateHEX(payload.arg("color"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Invalid input")
					.setColor("#cd1818")
					.setDescription(result.message)
			]
		});

		payload.config.color = result.value;
		payload.config.changed("color");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Default color set")
					.setColor(payload.config.color)
					.setDescription(`All new usergroups will by default now have the HEX color \`#${payload.config.color.toString(16)}\``)
			]
		});
	}
}