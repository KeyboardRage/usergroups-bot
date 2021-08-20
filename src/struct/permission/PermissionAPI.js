const PermissionTester = require("./PermissionTester");

class PermissionAPI {
	constructor(permissionApiConfig) {
		this.config = permissionApiConfig;

		/**
		 * @abstract
		 * @type {GlobalAPI}
		 */
		this.api = undefined;

		this._devs = new Set([
			"164736401051484160", // Virtus
			"381773157121654785", // Whis
		]);

		this._testers = new Set([
			"126754528912474112", // Megumin
			"501421972731854863", // Krour
			"282248983617863681", // Kenny
		]);

		this._cache = Object();
		this.loadAllPermissions(require("./map"));
	}

	/**
	 * Sets the Global API circular dependency
	 * @param {GlobalAPI} api
	 */
	setApi(api) {
		this.api = api;
	}

	/**
	 * Creates a new PermissionTester instance
	 * @param {SlashPayload} payload
	 * @return {PermissionTester}
	 */
	makeTester(payload) {
		return new PermissionTester(this, payload);
	}

	/**
	 * The result of a permission evaluation
	 * @typedef {Object} EvalResult
	 * @prop {Boolean} access If evaluation returned ture or false
	 * @prop {String} [node] The permission node user had that caused a true/false. Is 'null' if no matches.
	 * @prop {String} needed The permission node needed for this to be true
	 * @prop {Array<String>} has An array of permission nodes the user has
	 */
	// noinspection DuplicatedCode
	/**
	 * Evaluate permissions based on what is required and what is provided
	 * @param {String} required The required permission string
	 * @param {String|Array<String>} has The permissions this entity has
	 * @param {('any'|'all')} [mode="any"] The checking mode for permissions. Returns 'true' or 'false' if [required] is true for [mode] nodes of [has].
	 * @returns {EvalResult}
	 */
	eval(required, has, mode = "any") {
		if (!required) return {
			access: has.includes("**"),
			needed: null,
			node: has.includes("**") ? "**" : null,
			has
		};

		if (!Array.isArray(has)) has = [has];

		/**
		 * The required node split up
		 * @type {Array<String>}
		 */
		const requires = required.split(".");

		/**
		 * If mode 'all', counter that need to be 0
		 * @type {Number}
		 */
		let requiredMatches = has.length;

		/**
		 * Function that structures the returned result
		 * @param {Boolean} bool The result of the evaluation
		 * @param {String} currentNode The current node that warranted a true/false
		 * @returns {EvalResult}
		 */
		const r = function (bool, currentNode) {
			const result = {
				access: bool,
				needed: required,
				node: currentNode,
				has
			};

			// If any was match, return result. If it was a 'no' when 'all', then return
			if ((mode === "any") && bool || (mode === "all" && !bool)) return result;

			// Subtract needed matches and continue
			if (mode === "all") {
				requiredMatches--;
				if (!requiredMatches) return result;
			}
		};

		for (let k = 0; k < has.length; k++) {
			if (has[k] === required) {
				const f = r(true, has[k]);
				if (f !== undefined) return f;
				continue;
			}

			/**
			 * The permission node split up
			 * @type {Array<String>}
			 */
			const perm = has[k].split(".");

			/**
			 * The index of the current requirement sub-node
			 * @type {Number}
			 */
			let reqIndex = 0;

			/**
			 * The index of the current permission sub-node
			 * @type {Number}
			 */
			let permIndex = 0;

			/**
			 * If we're using any kind of wildcard
			 * @type {Boolean}
			 */
			let usingWildcard = false;

			/**
			 * Defines if required or perm is using the wildcard
			 * true = perm. false = required.
			 * @type {Boolean}
			 */
			let wildIsPerm = true;

			/**
			 * Flag to exit the while loop
			 * @type {Boolean}
			 */
			let concluded = false;

			while (!concluded) {

				// If we're using wildcard, check for end of matching
				if (usingWildcard) {
					if (requires[reqIndex] === perm[permIndex]) {
						usingWildcard = false;
						reqIndex++;
						permIndex++;
					} else if (!wildIsPerm) permIndex++;
					else reqIndex++;
				}

				// Check if we reached either end or array, make verdict
				if (reqIndex >= requires.length) {
					// End if wildcard is still active, and req was deciding factor
					if (usingWildcard && reqIndex < permIndex) {
						const f = r(true, has[k]);
						if (f !== undefined) return f;
						concluded = true;
						break;
					}

					// Ends with *
					if (requires[reqIndex] === "*" || requires[reqIndex] === "**") {
						const f = r(true, has[k]);
						if (f !== undefined) return f;
						concluded = true;
						break;
					}

					// Final check if last bit is identical
					const f = r(perm[permIndex] === requires[reqIndex], has[k]);
					if (f !== undefined) return f;
					concluded = true;
					break;
				}
				if (permIndex >= perm.length) {
					// End if wildcard is still active, and permIndex was deciding factor
					if (usingWildcard && reqIndex > permIndex) {
						const f = r(true, has[k]);
						if (f !== undefined) return f;
						concluded = true;
						break;
					}

					// Ends with *
					if (perm[permIndex] === "*" || perm[permIndex] === "**") {
						const f = r(true, has[k]);
						if (f !== undefined) return f;
						concluded = true;
						break;
					}

					// Final check if last bit is identical
					const f = r(perm[permIndex] === requires[reqIndex], has[k]);
					if (f !== undefined) return f;
					concluded = true;
					break;
				}

				// Assume true
				if (perm[permIndex] === "*" || requires[reqIndex] === "*") {
					wildIsPerm = perm[permIndex] === "*";
					permIndex++;
					reqIndex++;
					usingWildcard = false;
					continue;
				}

				// Wildcard was found
				if (perm[permIndex] === "**" || requires[reqIndex] === "**") {
					wildIsPerm = perm[permIndex] === "**";
					permIndex++;
					reqIndex++;
					usingWildcard = true;
					continue;
				}

				// Identical sub-nodes
				if (perm[permIndex] === requires[reqIndex]) {
					permIndex++;
					reqIndex++;
					usingWildcard = false;
					continue;
				}

				if (usingWildcard) continue;

				// Should never be reached unless mismatch in sub-node
				concluded = true;
				break;
			}
		}

		return {
			access: false,
			needed: required,
			node: null,
			has
		};
	}

	/**
	 * Generates permissions user will have based on the payload
	 * @param {SlashPayload} payload The command payload
	 * @param {Usergroup} [group] The target usergroup, if any
	 * @returns {Array<String>}
	 */
	generatePermissions(payload, group) {
		if (this._devs.has(payload.user.id)) return this._groups.dev;
		if (!payload.guild) return this._groups.dm;

		if (this._testers.has(payload.user.id)) return this._groups.tester;
		if (payload.guild.ownerId === payload.user.id) return this._groups.guild_owner;
		if (payload.member.permissions.has("ADMINISTRATOR")) return this._groups.guild_admin;
		if (!group) return this._groups.member;

		// These need 'group' to be populated
		if (group.owner.id===payload.user.id) return this._groups.group_owner;
		if (group.isMember(payload.user.id)) return this._groups.group_member;
		return this._groups.member;
	}

	/**
	 * Loads all permissions from a permissions map
	 * @param {Object} groupsMap
	 */
	loadAllPermissions(groupsMap) {
		this._groupsTemplate = groupsMap;
		this._groups = this._cache = Object();
		for (const groupName in this._groupsTemplate) {
			this._groups[groupName] = Array.from(this.loadPermissions(groupName));
		}
	}

	/**
	 * Load all permissions for a given permission group
	 * @param {String} groupName The name of the group to get permissions of
	 * @return {Set<String>}
	 */
	loadPermissions(groupName) {
		if (this._cache[groupName]) return this._cache[groupName];
		if (!this._groupsTemplate[groupName]) return new Set();

		const nodes = new Set(this._groupsTemplate[groupName].nodes);

		this._groupsTemplate[groupName].inherit.forEach(inheritName => {
			if (this._groupsTemplate[inheritName]) {
				const loaded = new Set();
				this._recursivelyLoadPermissionsOfGroup(inheritName, loaded, nodes);
			}
		});

		this._cache[groupName] = nodes;
		return nodes;
	}

	/**
	 * Recursively adds permissions of a group and its inherited roles
	 * @param {String} groupName The name of the permission group to inherit
	 * @param {Set<String>} loaded A set of loaded permission groups
	 * @param {Set<String>} nodes A set of permission nodes that is being added
	 * @return {void}
	 * @private
	 */
	_recursivelyLoadPermissionsOfGroup(groupName, loaded, nodes) {
		if (!this._groupsTemplate[groupName]) return;
		this._groupsTemplate[groupName].nodes.forEach(n => nodes.add(n));

		if (this._groupsTemplate[groupName].inherit?.length) {
			this._groupsTemplate[groupName].inherit.forEach(inheritName => {
				if (this._groupsTemplate[inheritName] && !loaded.has(inheritName)) {
					loaded.add(inheritName);
					this._recursivelyLoadPermissionsOfGroup(inheritName, loaded, nodes);
				}
			});
		}
	}
}

module.exports = PermissionAPI;