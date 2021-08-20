module.exports = {
	name: "ephemeral",
	desc: "Send test message with or without ephemeral mode",
	permission: "example.ephemeral",
	options: [{
		type: "BOOLEAN",
		name: "ephemeral",
		desc: "If we want to send as ephemeral or not",
		required: true
	}],
	async exec(payload) {

		// Prepare our text
		let text = payload.arg("ephemeral")
			? "Ephemeral!"
			: "Everyone can see this!";


		// Send the reply
		return payload.reply({
			content: text,
			ephemeral: payload.arg("ephemeral") // True/False
		});
	}
}