const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "publish",
	desc: "Re-publish one or all commands",
	permission: "dev.publish",
	options: [{
		type: "BOOLEAN",
		name: "all_commands",
		desc: "Whether or not to publish all commands again",
		required: true
	}, {
		type: "STRING",
		name: "command",
		desc: "If not all; the command to re-publish"
	}],
	async exec(payload) {
		if (payload.arg("all_commands")) {
			await payload.api.cmdApi.bulkPush("873296049391943682");
			return payload.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Published")
						.setColor("#18cd18")
						.setDescription(`Published all commands to \`873296049391943682\``)
				]
			});
		}

		// We need a command if 'All' is false
		if (!payload.arg("command")) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Missing argument")
					.setColor("#cd1818")
					.setDescription(`If not re-publishing all, you need to specify which root command to publish`)
			]
		});

		// Command exist or not
		if (!payload.api.cmdApi.has(payload.arg("command"))) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Not found")
					.setColor("#cd1818")
					.setDescription(`Could not find a root command by the name \`${payload.arg("command")}\``)
			]
		});

		// Execute
		await payload.api.cmdApi.commandPush("873296049391943682", payload.arg("command"));
		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Published command")
					.setColor("#18cd18")
					.setDescription(`Successfully published the command \`${payload.arg("command")}\``)
			]
		});
	}
}