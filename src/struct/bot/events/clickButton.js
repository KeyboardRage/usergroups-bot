module.exports = ({bot}) => {
	bot.on("clickButton", async button => {
		// console.log(button);
		button.reply.send("Okay");
	});
}