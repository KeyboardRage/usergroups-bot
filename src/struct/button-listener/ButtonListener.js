class ButtonListener {
	constructor(buttonListenerConfig) {
		this.config = buttonListenerConfig;
		this.callbacks = new Map();

		this.api = undefined;
	}

	/**
	 * Sets the Global API circular dependency
	 * @param {GlobalAPI} api
	 */
	setApi(api) {
		this.api = api;
	}

	/**
	 * Adds a callback to the button listener
	 * @param {Function} callback The callback to execute
	 * @param {Number} [expires=300] The time to leave this listener open in seconds. Upon expiry, executes callback without int.
	 * @return {String} The ID of the listener
	 */
	add(callback, expires=300) {
		if (expires > this.config.maxExpire) throw new Error(`Expiry too high, max is ${this.config.maxExpire}`);

		const id = this.genId();

		let timer = setTimeout(()=>this.run(id, null), expires*1000);
		this.callbacks.set(id, {callback, timer});

		return id;
	}

	/**
	 * Runs the callback
	 * @param {String} id ID of the callback to run
	 * @param {*|undefined} context The context, if any
	 * @return {null|*}
	 */
	run(id, context) {
		if (!this.callbacks.has(id)) return null;
		const cb = this.callbacks.get(id);

		clearTimeout(cb.timer);
		this.callbacks.delete(id);

		return cb.callback(this.api, context);
	}

	/**
	 * Generates a unique ID for a callback listener
	 * @return {String}
	 */
	genId() {
		let id = Math.random().toString(16).slice(2, 16);
		while(this.callbacks.has(id)) {
			id = Math.random().toString(16).slice(2, 16);
		}
		return id;
	}
}

module.exports = ButtonListener;