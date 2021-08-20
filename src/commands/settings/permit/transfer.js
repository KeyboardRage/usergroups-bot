const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "transfer",
	desc: "Allow/deny users ability to transfer group ownership",
	cooldown: 1000,
	options: [{
		name: "allowed",
		desc: "If it's allowed or not",
		type: "BOOLEAN",
		required: true
	}],
	permission: "settings.permit.transfer",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		payload.config.transfer = payload.arg("allowed");
		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Permission set")
					.setColor("#18cd18")
					.setDescription(`A group **may${payload.config.transfer?"":" not"}** transfer ownership from one user to another.`)
			]
		});
	}
}