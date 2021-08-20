const {MessageSelectMenu, MessageEmbed, MessageActionRow} = require("discord.js");
module.exports = {
	name: "options",
	desc: "Show the options menu",
	permission: "example.options",
	options: [],
	async exec(payload) {

		// Define our options
		const options = [
			{
				label: "One",
				description: "This is option one",
				value: "option.1",
				emoji: "1️⃣"
			}, {
				label: "Two",
				description: "This the second option",
				value: "option.2",
			}, {
				label: "Three",
				description: "All good things are three",
				value: "option.3",
				emoji: "3️⃣",
				default: true
			}
		];


		// Create the menu
		const menu = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId("menu.options.id")
					.setPlaceholder(`Pick an option! 👀`)
					.addOptions(options)
					.setMinValues(1)
					.setMaxValues(1)
			);


		// Send menu, and tell it to return the message the bot sent so we can use it
		const theReply = await payload.reply({
			components: [menu],
			embeds: [new MessageEmbed().setDescription("Hey, time to choose!")],
			fetchReply: true
		});


		// Collect interactions made by users on the menu message the bot sent
		const collectedInteraction = await theReply.awaitMessageComponent({
			filter: interaction => interaction.user.id === payload.user.id,
			time: 10_000,
			componentType: "SELECT_MENU"
		});


		// Delete the menu message, to avoid confusion
		await theReply.delete();


		// Let user know we processed it
		return theReply.edit({
			content: `You picked **${collectedInteraction.values[0]}**!`,
			ephemeral: true
		});
	}
}