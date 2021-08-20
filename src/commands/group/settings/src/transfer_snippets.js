module.exports = {
	/**
	 * Handles moving/removing old owner
	 * @param {SlashPayload} payload
	 * @param {Usergroup} group
	 * @return {Promise<void>}
	 */
	async moveOldOwner(payload, group) {
		if (payload.arg("stay")) {
			// Create reference also as a member
			group.members.set(group.owner.id, group.owner);
			group.changed("members");
		} else {
			await group.removeRole(group.owner.id, `User transferred ownership to ${payload.arg("new-owner")} and decided not to stay as member`);
		}
	},
	/**
	 * Handles moving/removing new owner
	 * @param {SlashPayload} payload
	 * @param {Usergroup} group
	 * @return {Promise<void>}
	 */
	async moveNewOwner(payload, group) {
		let oldOwnerId = group.owner.id;

		// If already a member, just modify cache
		if (group.isMember(payload.arg("new-owner"))) {
			// Overwrite owner instance to use member
			group.owner = group.members.get(payload.arg("new-owner"));
			// Remove from member list
			group.members.delete(payload.arg("new-owner"));
			group.changed("members");
		}
		// If not already member, we need to give them the guild role
		else {
			const member = await payload.guild.members.fetch(payload.arg("new-owner"));
			await member.roles.add(group.meta.role_id, "User took ownership of the group");
		}

		// Set new owner
		group.owner = group.makeMember({
			_id: payload.arg("new-owner"),
			by: oldOwnerId
		});
		group.changed("owner");
	},

	/**
	 * The categories will have hard-set permissions for owner. We need to edit those
	 * @param {SlashPayload} payload
	 * @param {Usergroup} group
	 * @return {Promise<void>}
	 */
	async updateChannelPermissions(payload, group) {
		for await (const area of group.areas) {
			// Get channel
			const category = payload.guild.channels.resolve(area._id);

			// Set new permissions. Owner info must have been changed in cache before using this
			if (category) await category.permissionOverwrites.set(
				payload.api.groupApi.tools.channelManager.makeCategoryPermissions({
					groupApi: payload.api.groupApi,
					roleId: group.meta.role_id,
					guildId: payload.guild.id,
					ownerId: payload.arg("new-owner")
				})
			);
		}
	}
}