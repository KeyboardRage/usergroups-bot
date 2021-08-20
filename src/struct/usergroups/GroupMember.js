class GroupMember {
	constructor(usergroup, memberData) {
		this.group = usergroup;

		this._id = memberData._id || memberData.id;
		this.role = memberData.role;
		this.flags = memberData.flags || 0;
		this.by = memberData.by || null;
		this.createdAt = memberData.createdAt || new Date();
	}

	/**
	 * Returns a Discord relative timestamp of when the user joined the group
	 * @returns {String}
	 */
	get joined() {
		return `<t:${parseInt((this.createdAt.getTime()/1000).toFixed(0))}:R>`;
	}

	/**
	 * The User ID of this member
	 * @return {String}
	 */
	get id() {
		return this._id;
	}

	/**
	 * If this member is the group founder or not
	 * @return {Boolean}
	 */
	get isFounder() {
		return !!(this.flags & this.group.groupApi.config.memberFlags.founder);
	}

	/**
	 * Remove this member from the usergroup
	 * @param {String} [reason="Unknown reason"] Reason why member was removed
	 * @return {Promise<void|boolean>}
	 */
	remove(reason="Unknown reason") {
		return this.group.removeMember(this.id, reason);
	}

	/**
	 * Return this member as a plain object
	 * @return {{createdAt: (*|Date), role, by: *, flags: (*|number), _id: String}}
	 */
	toObject() {
		return {
			_id: this.id,
			role: this.role,
			flags: this.flags,
			by: this.by,
			createdAt: this.createdAt
		}
	}
}

module.exports = GroupMember;