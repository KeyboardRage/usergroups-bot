const dev = {
	inherit: [],
	nodes: ["**"]
};

const dm = {
	inherit: [],
	nodes: [
		"bot.invite",
		"bot.info",
	]
}

const member = {
	inherit: ["dm"],
	nodes: [
		"group.list",
		"group.list.members",
		"group.me",
		"group.me.*",
		"group.set",
		"group.settings",
	]
}

const group_member = {
	inherit: ["member"],
	nodes: [
		"group.me",
		"group.set",
		"group.settings",
		"group.list",
		"list",
	]
};

const group_owner = {
	inherit: ["group_member"],
	nodes: [
		"group.delete.*",
		"group.member.add",
		"group.member.kick",
		"group.member.invite",
		"group.set.*",
		"group.settings.*",
		"group.new.channel.*"
	]
};

const tester = {
	inherit: ["group_owner"],
	nodes: [
		"group.new.group",
		"group.set",
		"group.me",
		"group.me.*",
		"group.settings",
		"group.member",
		"group.set.**",
		"group.settings.**",
		"group.member.**",
		"group.list",
		"group.list.*",
		"list",
	]
}

const guild_admin = {
	inherit: ["group_owner"],
	nodes: [
		"sudo.group.delete.*",
		"sudo.group.member.*",
		"sudo.group.set.*",
		"sudo.group.settings.*",
		"group.new.**",
		"sudo.group.new.**",
		"settings.permit.**",
		"settings.set.**",
		"settings.max.**",
	]
};

const guild_owner = {
	inherit: ["guild_admin"],
	nodes: [
		"settings.**",
		"group.**",
	]
};

module.exports = {tester,dev,dm,member,group_member,group_owner,guild_admin,guild_owner};