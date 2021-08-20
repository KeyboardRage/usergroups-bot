const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "custom-color",
	desc: "Groups must use default color or can pick custom",
	cooldown: 1000,
	options: [{
		name: "allowed",
		desc: "Allow groups to use custom colors",
		type: "BOOLEAN",
		required: true,
	}],
	permission: "settings.permit.custom_color",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		payload.config.custom_color = payload.arg("allowed");
		await payload.config.save();

		const embed = new MessageEmbed()
			.setTitle("Permission set")
			.setColor("#18cd18")
			.setDescription(`A group **may${payload.arg("allowed")?"":" not"}** set their own custom color.`);

		if (!payload.arg("allowed")) embed.addField("Default color", `New groups defaults to and are required to use the default color: \`#${payload.config.color.toString(16)}\`.\
			\nDefault color can be changed with \`/settings set default-color <color>\`.`)
		else embed.addField("Custom color", `New and existing groups can set a color of their choice using \`/group set color <color>\`.`)

		return payload.reply({embeds: [embed]});
	}
}