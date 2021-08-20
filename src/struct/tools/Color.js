class Color {
	constructor() {}

	/**
	 * Validates a HEX string, and normalises it
	 * @param {String} input
	 * @return {{valid: boolean, message: null, value: number}|{valid: boolean, message: string}}
	 */
	static validateHEX(input) {
		if (typeof(input)!=="string") return {
			valid: false,
			message: "Invalid input. It must be a string"
		}

		if (input.length !== 7 && input.length !== 6) return {
			valid: false,
			message: "Invalid syntax for full HEX color." +
				"\nExample HEX color: \`#cd18cd\`"
		}

		input = input.toUpperCase();
		if (/^#?[A-F0-9]{6}$/.test(input) === false) return {
			valid: false,
			message: "Invalid syntax for full HEX color." +
				"\nExample HEX color: \`#cd18cd\`"
		}

		return {
			valid: true,
			message: null,
			value: parseInt(`${input.replace("#","")}`, 16)
		}
	}
}

module.exports = Color;