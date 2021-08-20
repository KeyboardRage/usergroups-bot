const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "groups",
	desc: "List all existing groups",
	options: [],
	permission: "group.list",
	cooldown: 1000,
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload) {
		const groups = await payload.api.groupApi.groupsFromGuild(payload.guild.id);

		const embed = new MessageEmbed()
			.setTitle("List of Usergroups");

		let i=0;
		groups.each(group => {
			if (i<24) {
				embed.addField(group.name, `Owner: <@${group.owner.id}>\
					\nMembers: ${group.members.size}\
					\nDescription: ${group.meta?.desc ? group.meta.desc : "`No description`"}`)
			}
			i++;
		});

		return payload.reply({
			embeds: [embed]
		});
	}
}