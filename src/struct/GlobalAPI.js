class GlobalAPI {
	constructor({
		bot,
		mongo,
		redis,
		cmdApi,
        guildApi,
		groupApi,
        buttonListener,
        permsApi,
		errorApi,
	            }) {
		this.bot = bot;
		this.mongo = mongo;
		this.redis = redis;
		this.cmdApi = cmdApi;
		this.guildApi = guildApi;
		this.groupApi = groupApi;
		this.buttonListener = buttonListener;
		this.permsApi = permsApi;
		this.errorApi = errorApi;

		this._setApi();
	}

	/**
	 * Automatically set up circular dependency for properties that have a 'setApi' method
	 * @private
	 */
	_setApi() {
		Object.getOwnPropertyNames(this).forEach(prop => {
			if ("setApi" in this[prop]) this[prop].setApi(this);
		});
	}
}

module.exports = GlobalAPI;