module.exports = models => {
	return {

		"guildConfig": {
			/**
			 * Find config for a guild by its ID
			 * @param {String} guildId
			 * @return {Promise<Object>}
			 */
			fetchConfig(guildId) {
				return models.guild.findById(guildId).lean().exec();
			},
			/**
			 * Inserts a new Guild Config into the database
			 * @param {Object} guildConfig
			 * @return {Promise<Document>}
			 */
			insertConfig(guildConfig) {
				const config = new models.guild(guildConfig);
				return config.save();
			},
			/**
			 * Updates config data for a guild
			 * @param {String} guildId The ID of the guild
			 * @param {Object} newConfig The new fields to be overwritten
			 * @return {Promise<Object>}
			 */
			updateData(guildId, newConfig) {
				return models.guild.updateOne({_id: guildId}, {$set: newConfig}).exec();
			}
		},

		"usergroups": {
			/**
			 * Retrieve a specific group by ID
			 * @param {String} groupId The unique ID of the group to get
			 * @return {Promise<LeanDocument>}
			 */
			getById(groupId) {
				return models.group.findById(groupId).lean().exec();
			},
			/**
			 * Return all usergroups in the database
			 * @return {Promise<Array<Object>>}
			 */
			getAll() {
				return models.group.find({}).lean().exec();
			},
			/**
			 * Inserts a group into the database
			 * @param {Object} groupData
			 * @return {*}
			 */
			insert(groupData) {
				const group = new models.group(groupData);
				return group.save();
			},
			/**
			 * Updates the group by overwriting data inside newData
			 * @param {String} groupId
			 * @param {Object} newData
			 * @return {Promise<Object>}
			 */
			updateData(groupId, newData) {
				return models.group.updateOne({_id: groupId}, {$set: newData});
			},
			/**
			 * Searches for a guild that have a TextChannel area by a given ID
			 * @param {String} channelId
			 * @return {Promise<LeanDocument|null>}
			 */
			findGroupWithTextChannel(channelId) {
				return models.group.findOne({"areas.text": channelId}).lean().exec();
			},
			/**
			 * Find all groups that are in a guild
			 * @param {String} guildId
			 * @param {Boolean} [idOnly=false] Whether or not to only return the ID's of the guild
			 * @return {Promise<Array<LeanDocument>>}
			 */
			findGroupsInGuild(guildId,idOnly=false) {
				if (idOnly) models.group.find({"guild": guildId}, ["_id"]).lean().exec();
				return models.group.find({"guild": guildId}).lean().exec();
			},
			/**
			 * Deletes a group by ID
			 * @param {String} groupId The ID of the group to delete
			 * @return {Promise<Object>}
			 */
			delete(groupId) {
				return models.group.deleteOne({_id: groupId}).exec();
			},
			/**
			 * Find group based on the guild and channel ID
			 * @param {String} guildId The ID of the guild
			 * @param {String} channelId The ID of the channel
			 * @returns {Promise<Object|null>}
			 */
			getGroupFromChannel(guildId, channelId) {
				// TODO Look into if aggregation filter by guild *then* channel is faster
				return models.group.findOne({guild: guildId, $or: [
					{"areas.text": channelId},
					{"areas.voice": channelId}
				]}).lean().exec();
			},
			/**
			 * Return all groups that contain any of the ID's
			 * @param {Array<String>} groupIds
			 * @return {Promise<Array<LeanDocument>>}
			 */
			getGroupsByIds(groupIds) {
				return models.group.find({_id: {$in: groupIds}}).lean().exec();
			},
			/**
			 * Removes a user from a groups member list
			 * @param {String} groupId The group ID
			 * @param {String} userId The user ID to be removed
			 * @returns {Promise<Object>}
			 */
			removeMember(groupId, userId) {
				return models.group.updateOne({_id: groupId}, {$pull:{"members": {_id: userId}}}, {multi: true}).exec();
			}
		}
	}
}