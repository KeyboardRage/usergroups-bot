module.exports = {
	name: "think",
	desc: "Let bot think for 3 seconds",
	permission: "example.think",
	options: [{
		type: "BOOLEAN",
		name: "ephemeral",
		desc: "Let other users see you used this command"
	}],
	async exec(payload) {

		// Let user know we're thinking now
		await payload.deferReply({
			ephemeral: !!payload.arg("ephemeral")
		});


		// Wait a little...
		setTimeout(async () => {

			// ... then let user know we stopped thinking
			await payload.followUp({
				content: "I have stopped thinking."
			});

		}, 3000);

	}
}