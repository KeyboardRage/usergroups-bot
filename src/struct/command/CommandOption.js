const TypeNumbers = {
	1: "SUB_COMMAND",
	2: "SUB_COMMAND_GROUP",
	3: "STRING",
	4: "INTEGER",
	5: "BOOLEAN",
	6: "USER",
	7: "CHANNEL",
	8: "ROLE",
	9: "MENTIONABLE",
}
const TypeStrings = {
	"SUB_COMMAND":          1,
	"SUB_COMMAND_GROUP":    2,
	"STRING":               3,
	"INTEGER":              4,
	"BOOLEAN":              5,
	"USER":                 6,
	"CHANNEL":              7,
	"ROLE":                 8,
	"MENTIONABLE":          9,
}

class CommandOption {
	constructor(optionData) {
		this._type = optionData.type;
		if (typeof(this._type) == "string") this._type = TypeStrings[this._type];

		this.value = optionData.value;
		this.name = optionData.name;
		this.desc = optionData.desc || optionData.description;
		if (optionData.required) this.required = !!optionData.required;

		/**
		 * Loop over all options inside and convert them too
		 */
		if (optionData.options && optionData.options.length) {
			this.options = optionData.options.map(option => new CommandOption(option));
		}

		if (optionData.choices && optionData.choices.length) {
			this.choices = optionData.choices;
		}

		return this;
	}

	get cmd() {
		return this._type===TypeStrings.SUB_COMMAND;
	}

	get group() {
		return this._type===TypeStrings.SUB_COMMAND_GROUP;
	}

	get user() {
		return this._type===TypeStrings.USER;
	}

	get role() {
		return this._type===TypeStrings.ROLE;
	}

	get channel() {
		return this._type===TypeStrings.CHANNEL;
	}

	get boolean() {
		return this._type===TypeStrings.BOOLEAN;
	}

	get string() {
		return this._type===TypeStrings.STRING;
	}

	get int() {
		return this._type===TypeStrings.STRING;
	}

	get mention() {
		return this._type===TypeStrings.MENTIONABLE;
	}

	/**
	 * Get the type
	 * @param {Boolean} [asString=false] Return the type as string instead of number
	 * @return {Number|String}
	 */
	type(asString) {
		if (asString) return TypeNumbers[this._type];
		return this._type;
	}

	/**
	 * Converts this type to JS Object
	 * @return {{name: String, type: (Number|String), description, value, choices}}
	 */
	toObject() {
		return {
			name: this.name,
			value: this.value,
			type: this.type(),
			required: this.required,
			description: this.desc,
			choices: this.choices
		}
	}
}

module.exports = CommandOption;