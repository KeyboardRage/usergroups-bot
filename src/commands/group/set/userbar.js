const { MessageEmbed } = require("discord.js");
const Image = require("../../../struct/tools/Image");

module.exports = {
	name: "userbar",
	desc: "Set a new userbar for the group",
	permission: "group.set",
	cooldown: 1000,
	options: [{
		type: "STRING",
		name: "url",
		desc: "The image URL to use",
		required: true
	}, {
		type: "STRING",
		name: "name",
		desc: "The name of the group to manage. Default: The group this channel belongs to"
	}],
	async exec(payload) {
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("name")
		);
		payload.perms.group(group);

		// Group exist
		if (!group) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**Not found:**\
					\n${!payload.arg("name")
						? "This channel does not belong to a usergroup."
						: `Could not find group by the name **${payload.arg("name")}**`}`)
			]
		});

		// Check permission to delete
		if (!payload.can("group.set.userbar"))
			return payload.cant(`You don't have permission to set userbar of **${group.name}**.`);

		// Validate the url
		const result = await Image.isImage(payload.arg("url"));
		if (!result.valid) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Invalid image")
					.setColor("#cd1818")
					.setDescription(`Could not verify that the URL serves an image.`)
			]
		});

		// Check file size
		const fileSize = await Image.remoteImageDimensions(payload.arg("url"));
		console.log(fileSize);

		if (payload.config.userbar.exact) {
			if (fileSize.width !== payload.config.userbar.w || fileSize.height !== payload.config.userbar.h)
				return payload.reply({
					embeds: [
						new MessageEmbed()
							.setTitle("Invalid size")
							.setColor("#cd1818")
							.setDescription(`Userbars need to be ***exactly*** ${payload.config.userbar.w} × ${payload.config.userbar.h} pixels.`)
					]
				});
		} else {
			if (fileSize.width > payload.config.userbar.w || fileSize.height > payload.config.userbar.h)
				return payload.reply({
					embeds: [
						new MessageEmbed()
							.setTitle("Invalid size")
							.setColor("#cd1818")
							.setDescription(`Userbars need to be ***within*** ${payload.config.userbar.w} × ${payload.config.userbar.h} pixels.`)
					]
				});
		}

		// Set the content and save it
		group.meta.userbar = payload.arg("url");
		group.changed("meta");
		await group.save();

		return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor(group.color(payload.config))
					.setTitle("Userbar set")
					.setDescription(`Image URL: ${payload.arg("url")}\n*If you change image at this URL, Discord may be using a cached version of it.*`)
					.setImage(payload.arg("url"))
					.setFooter(group.name)
			]
		});
	}
}