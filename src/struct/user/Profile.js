const { Collection } = require("discord.js");

class Profile {
	constructor(profileApi, profileData) {
		this.profileApi = profileApi;

		this._id = profileData._id;
		this.groups = new Collection();
	}

	get id() {
		return this._id;
	}
}

module.exports = Profile;