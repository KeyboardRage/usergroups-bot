const {MessageEmbed} = require("discord.js");

class PermissionTester {
	/**
	 * @param {PermissionAPI} permissionApi
	 * @param {SlashPayload} payload
	 */
	constructor(permissionApi, payload) {
		this.permsApi = permissionApi;
		this.payload = payload;
		this.permissions = permissionApi.generatePermissions(payload);
		/**
		 * @type {EvalResult}
		 * @private
		 */
		this._lastResult = undefined;
	}

	/**
	 * Check if a user have access or not to something
	 * @param {String} permissions The permissions user need
	 * @return {Boolean}
	 */
	can(permissions) {
		this._lastResult = this.permsApi.eval(permissions, this.permissions);
		return this._lastResult.access;
	}

	/**
	 * Updates permissions now considering the target group user might be part of
	 * @param {Usergroup} group
	 * @returns {PermissionTester}
	 */
	group(group) {
		if (!group) return this;
		this.permissions = this.permsApi.generatePermissions(this.payload, group);
		return this;
	}

	/**
	 * Creates a permission denied message you can pass to payload.reply();
	 * @param {String} [message] A custom message
	 * @return {{embeds: MessageEmbed[]}}
	 */
	embed(message) {
		return {
			embeds:[
				new MessageEmbed()
					.setTitle("No permission")
					.setColor("#cd1818")
					.setDescription(message || "You do not have permissions required to use this command.")
					.setFooter(`Missing: ${this._lastResult.needed}`)
			]
		}
	}
}

module.exports = PermissionTester;