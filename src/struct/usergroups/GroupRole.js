class GroupRole {
	constructor(usergroup, roleData) {
		this.group = usergroup;

		// We want 'name' to give upper case display name, and 'id' to give lowercase for comparisons
		this._name = roleData.name || roleData._id;
		this.desc = roleData.desc || null;
		this.flags = roleData.flags || 0;
	}

	get name() {
		return this._name;
	}

	get id() {
		return this._name.toLowerCase();
	}
}

module.exports = GroupRole;