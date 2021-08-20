const {MessageButton, MessageActionRow} = require("discord.js");
module.exports = {
	name: "button",
	desc: "Showcase buttons",
	permission: "example.button",
	options: [],
	async exec(payload) {

		// Send message with buttons
		const sentMessage = await payload.reply({
			content: "Take this balloon!",
			components: [makeButtons(true)],
			fetchReply: true
		});

		// Wait for button click
		let collected = await sentMessage.awaitMessageComponent({
			filter: interaction => interaction.user.id === payload.user.id,
			time: 10_000,
			componentType: "BUTTON"
		});



		// We don't need the response to the click...
		await collected.deferReply();
		await collected.deleteReply();

		// ... edit the original message instead
		await sentMessage.edit({
			content: `You popped it, we only have one left!`,
			components: [makeButtons(false)],
			fetchReply: true
		});



		// Wait for __another__ button click
		collected = await sentMessage.awaitMessageComponent({
			filter: interaction => interaction.user.id === payload.user.id,
			time: 10_000,
			componentType: "BUTTON"
		});


		// We don't need the response to the click...
		await collected.deferReply();
		await collected.deleteReply();


		// ... edit the original message instead
		return sentMessage.edit({
			content: `Welp, that was all the balloons we had!!`,
			components: [makeButtons(false, false)],
			fetchReply: true
		});
	}
}

function makeButtons(balloonInflated, reserve=true) {
	// Create buttons
	const one = new MessageButton()
		.setEmoji("💥")
		.setCustomId("balloon.pop")
		.setLabel("Pop balloon")
		.setStyle("DANGER")
		.setDisabled(!balloonInflated);
	const two = new MessageButton()
		.setEmoji("🎈")
		.setCustomId("balloon.inflate")
		.setLabel("Inflate balloon")
		.setStyle(!reserve || !!balloonInflated ? "SECONDARY" : "SUCCESS")
		.setDisabled(!reserve || !!balloonInflated);

	// Create button container
	return new MessageActionRow().addComponents(one, two);
}