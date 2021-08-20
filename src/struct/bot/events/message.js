module.exports = ({bot}) => {
	bot.on("message", async msg => {
		if (msg.author.bot) return null;
	});
}