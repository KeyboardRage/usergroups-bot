module.exports = ({bot, cmdApi}) => {
	bot.on("interactionCreate", async int => {
		if (!int.isCommand) return null;
		const payload = await cmdApi.makePayload(int);

		if (!payload.cmd || !cmdApi.has(payload.cmd)) return null;

		return cmdApi.run(payload);
	});
}