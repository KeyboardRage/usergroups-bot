module.exports = {
	makeCategoryPermissions({groupApi, ownerId, guildId, roleId}) {
		return [{
			id: ownerId,
			type: "member",
			allow: groupApi.config.permission.owner
		}, {
			id: roleId,
			type: "role",
			allow: groupApi.config.permission.grantRole,
		}, {
			id: guildId,
			type: "role",
			deny: groupApi.config.permission.denyRole
		}, {
			id: groupApi.api.bot.user.id,
			type: "member",
			allow: groupApi.config.permission.bot
		}]
	}
}