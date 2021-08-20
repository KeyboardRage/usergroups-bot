const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "reload",
	desc: "Reloads a command",
	permission: "dev.reload",
	options: [{
		type: "STRING",
		name: "command",
		desc: "The name of the root command to reload",
		required: true
	}],
	async exec(payload) {
		if (!payload.api.cmdApi.has(payload.arg("command"))) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Not found")
					.setColor("#cd1818")
					.setDescription(`Could not find a root command by the name \`${payload.arg("command")}\``)
			]
		});

		/**
		 * @type {CommandRoot}
		 */
		const cmd = payload.api.cmdApi.commands.get(payload.arg("command"));
		try {
			cmd.reload();
		} catch(err) {
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Error")
						.setColor("#cd1818")
						.setDescription(`An error occurred trying to reload \`${payload.arg("command")}\`:\
						\n\`\`\`${err.toString()}\`\`\``)
				]
			});
		}

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Reloaded")
					.setColor("#18cd18")
					.setDescription(`Successfully reloaded \`${payload.arg("command")}\``)
					.addField("Publishing", `Remember that you might want to \`/dev publish ${payload.arg("command")}\``)
			]
		});
	}
}