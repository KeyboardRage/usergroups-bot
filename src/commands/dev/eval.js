module.exports = {
	name: "eval",
	desc: "Evaluates JavaScript",
	permission: "dev.eval",
	options: [{
		type: "STRING",
		name: "javascript",
		desc: "Raw JavaScript to execute",
		required: true
	}],
	async exec(payload) {
		try {
			await payload.reply({
				content: `\`\`\`${await eval(payload.arg("javascript"))}\`\`\``
			})
		} catch(e) {
			console.error(`Error from Eval command:`);
			console.error(e);
			return payload.reply(`\`\`\`${e.toString()}\`\`\``);
		}
	}
}