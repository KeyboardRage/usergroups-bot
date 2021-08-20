module.exports = db => {
	const Int32 = require("mongoose-int32").loadType(db);
	const mongoose = require("mongoose");

	const groupMember = new mongoose.Schema({
		// The ID of the user
		"_id": {
			type: String,
			required: true
		},
		// The group role this user have
		"role": {
			type: String,
			required: false,
			default: null
		},
		// User that invited/added this user
		"by": {
			type: String,
			required: false,
			default: null
		},
		// Various flags for this member/user
		"flags": {
			type: Int32,
			required: true,
			default: 0
		}
	}, {
		timestamps: true
	});

	const groupRole = new mongoose.Schema({
		// The name of the permission role
		"_id": {
			type: String,
			required: true
		},
		// Description of the role
		"desc": {
			type: String,
			required: false,
			default: null,
			maxlength: 256
		},
		// Bitflag permissions this role have
		"permissions": {
			type: Int32,
			required: true,
			default: 0
		}
	});

	const groupArea = new mongoose.Schema({
		// Category ID
		"_id": {
			type: String
		},
		// ID's of text channels inside category
		"text": [String],
		// ID's of voice channels inside category
		"voice": [String]
	});

	return {
		guild: db.model("guild", new mongoose.Schema({
			"_id": String,
			"flags": {
				type: Int32,
				required: true,
				default: 0
			},
			"color": {
				type: Number,
				required: true,
				default: null // null = inherit, -1 = deny, other = this color
			},
			"max": {
				"groups": {
					type: Number,
					required: true,
					default: 24
				},
				"ownership": {
					type: Number,
					required: true,
					default: 24
				},
				"membership": {
					type: Number,
					required: true,
					default: 24
				},
				"text_channels": {
					type: Number,
					required: true,
					default: 30
				},
				"voice_channels": {
					type: Number,
					required: true,
					default: 30
				},
				"members": {
					type: Number,
					required: true,
					default: 100
				}
			},
			"userbar": {
				"w": {
					type: Number,
					required: true,
					default: 400
				},
				"h": {
					type: Number,
					required: true,
					default: 300
				},
				"exact": {
					type: Boolean,
					required: true,
					default: false
				},
				"ext": [String]
			},
			"prefix": {
				"category": {
					type: String,
					required: true,
					default: ""
				},
				"role": {
					type: String,
					required: true,
					default: ""
				},
			},
		}, {
			collection: "guilds",
			timestamps: true,
			createIndexes: true
		})),

		group: db.model("group", new mongoose.Schema({
			// The name of the group
			"name": {
				type: String,
				required: true,
				maxlength: 126,
			},
			// The guild this group belongs to
			"guild": {
				type: String,
				required: true
			},
			// Data about the owner
			"owner": groupMember,
			// User-changeable arbitrary values
			"meta": {
				// The In-Guild role ID members of this group will have
				"role_id": {
					type: String,
					required: true
				},
				// Description of the group
				"desc": {
					type: String,
					default: null,
					maxlength: 256
				},
				// The theme colour of the group as Int
				"color": {
					type: Number,
					default: null,
					max: 0xffffff,
					min: 0
				},
				// Full URL to the userbar image
				"userbar": {
					type: String,
					default: null
				},
				// Price group is being sold for if put up for sale
				"sales_price": {
					type: Number,
					default: null,
					min: 0,
					max: Number.MAX_SAFE_INTEGER
				},
				// The price to join the usergroup, if enabled
				"buy_in_price": {
					type: Number,
					default: 0,
					min: 0,
					max: Number.MAX_SAFE_INTEGER
				},
				// The Message of the Day
				"motd": {
					type: String,
					default: null,
					maxlength: 256
				}
			},
			// Areas this group have access to (categories, text channels, voice channels)
			"areas": [groupArea],
			// A list of members of this group
			"members": [groupMember],
			// A list of permission roles that users are assigned to for their permissions
			"roles": [groupRole],
			// Things that is locked from editing for this group
			"locked": {
				type: Int32,
				default: 0,
				required: true
			},
			// Various bitflags for this group
			"flags": {
				type: Int32,
				default: 0,
				required: true
			}
		}, {
			collection: "groups",
			timestamps: true
		})),
	}
}