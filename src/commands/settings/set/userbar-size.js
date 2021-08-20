const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "userbar-size",
	desc: "Make userbars confine to exact size or upper limit",
	cooldown: 1000,
	options: [{
		name: "mode",
		desc: "The size mode to use",
		type: "STRING",
		required: true,
		choices: [{
			name: "Max",
			value: "max"
		}, {
			name: "Exact",
			value: "exact"
		}]
	}],
	permission: "settings.set.userbar_size",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		if (!payload.arg("mode")) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Userbar size mode")
					.setColor("#18cd18")
					.setDescription(payload.config.userbar.exact
					? `A userbar must now be ***exactly*** **${payload.config.userbar.w} × ${payload.config.userbar.h} px**.`
					: `A userbar can now be ***up to*** **${payload.config.userbar.w} × ${payload.config.userbar.h} px**.`)
			]
		});

		let exact = payload.arg("mode") === "exact";
		if (exact !== payload.config.userbar.exact) payload.config.changed("userbar");
		payload.config.userbar.exact = exact;

		let string;
		if (exact) {
			string = `A userbar must now be ***exactly*** **${payload.config.userbar.w} × ${payload.config.userbar.h} px**.`;
		} else {
			string = `A userbar can now be ***up to*** **${payload.config.userbar.w} × ${payload.config.userbar.h} px**.`;
		}
		string += `\n\nChange the width/height dimensions using \`/settings max userbar-size <width> <height>\``;

		await payload.config.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle(payload.arg("prefix") ? "Saved prefix" : "Prefix settings")
					.setColor("#18dc18")
					.setDescription(`A prefix prepends an optional custom string before the group's name.\
						\n${payload.arg("prefix") ? `**Saved setting:**`:""}\n${string}`)
			]
		});
	}
}