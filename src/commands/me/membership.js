const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "membership",
	desc: "Check your group membership information",
	cooldown: 1000,
	options: [{
		type: "STRING",
		name: "name",
		desc: "The name of the group to check membership of. Default: The group this channel belongs to",
	}],
	permission: "group.me",
	/**
	 * @param {SlashPayload} payload
	 */
	async exec(payload){
		const group = await payload.api.groupApi.resolve(
			payload,
			payload.arg("name")
		);
		payload.perms.group(group);

		// Group exist
		if (!group) return payload.reply({
			embeds: [
				new MessageEmbed()
					.setColor("#cd1818")
					.setDescription(`**Not found:**\
					\n${!payload.arg("name")
						? "This channel does not belong to a usergroup."
						: `Could not find group by the name **${payload.arg("name")}**`}`)
			]
		});

		if (!payload.can("group.me.membership")) return payload.cant();

		if (!group.isOwner(payload.user.id) && !group.isMember(payload.user.id)) return payload.user.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Not a member")
					.setColor("#cd1818")
					.setDescription(`You are not a member of **${group.name}**`)
			]
		});

		let seniority = 1;
		const member = group.isOwner(payload.user.id) ? group.owner : group.members.get(payload.user.id);

		// Create cloned member list
		let g = group.members.clone();
		// Add owner to list
		g.set(group.owner.id, group.owner);

		// Sort and find seniority. Find a better way some time to do this
		g = g
			.sort((a,b) => a.createdAt>b.createdAt?1:-1)
			.mapValues(u => {
				return {
					id: u.id,
					seniority: seniority++
				}
			});

		let content = `**Joined:** ${member.joined}\
			\n**Seniority:** #${g.get(payload.user.id).seniority}`;

		if (group.isOwner(payload.user.id)) {
			content += `\n**Role:** Group Owner`;
		} else if (member.role) {
			content += `\n**Role:** ${member.role}`;
		} else {
			content += `\n**Role:** member`;
		}

		if (member.isFounder) {
			content += `\n\n🧑‍🦳 *Group Founder*`;
		}

		const embed = new MessageEmbed()
			.setColor(group.color(payload.config))
			.setTitle("Your membership")
			.setDescription(content)
			.setFooter(group.name);

		if (group.meta.userbar) embed.setImage(group.meta.userbar);

		return payload.reply({embeds: [embed]});
	}
}