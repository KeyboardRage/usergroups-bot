class CooldownManager {
	constructor(cooldownManagerConfig, cmdApi) {
		this.config = cooldownManagerConfig;
		this.cmdApi = cmdApi;

		this.cooldowns = {
			_users: new Set()
		};
	}

	/**
	 * Check if a user is on a cooldown
	 * @param {String} userId The user's ID
	 * @param {String} commandId The name of the command
	 * @return {Boolean}
	 */
	onCooldown(userId, commandId) {
		if (!commandId) return this.cooldowns._users.has(userId);
		if (!(commandId in this.cooldowns)) return false;
		return this.cooldowns[commandId].has(userId);
	}

	/**
	 * Add cooldown on a user
	 * @param {String} userId The User's ID
	 * @param {String} commandId The ID of the command itself
	 * @param {Number} cooldown How long the cooldown lasts, in MS
	 */
	add(userId, commandId, cooldown) {
		if (!cooldown) cooldown = this.config.fallbackCooldown;

		if (this.config.userGlobal) {
			this.cooldowns._users.add(userId);

			setTimeout(() => {
				this.remove(userId);
			}, cooldown);
		} else {
			if (!(commandId in this.cooldowns)) this.cooldowns[commandId] = new Set();
			this.cooldowns[commandId].add(userId);

			setTimeout(() => {
				this.remove(userId, commandId);
			}, cooldown);
		}
	}

	/**
	 * Remove cooldown on a user
	 * @param {String} userId The User's ID
	 * @param {String} [commandId] The command's ID. If not present, assumes _users set
	 */
	remove(userId, commandId) {
		if (!commandId) this.cooldowns._users.delete(userId);
		this.cooldowns[commandId].delete(userId);
	}
}

module.exports = CooldownManager;