module.exports = ({bot, groupApi}) => {
	bot.on("channelDelete", async channel => {
		if (!channel.guild) return null;
		const group = await groupApi.getGroupFromChannel(channel.guild.id, channel.id);
		if (!group) return null;
		return group.deleteChannel(channel.id);
	});
}