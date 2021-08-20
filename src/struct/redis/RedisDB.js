const ioredis = require("ioredis");

/**
 * A Redis interface
 * @prop {Object} Queries
 */
class RedisDB {
	constructor(redisConfig, _RedisQueries) {
		/**
		 * Temporary container for function that create queries
		 * @private
		 */
		this._RedisQueries = _RedisQueries;

		this.config = redisConfig;

		/**
		 * The Redis connection
		 * @type {ioredis.connection}
		 */
		this.connection = undefined;

		/**
		 * A container for Redis queries
		 * @type {Object}
		 */
		this.query = Object();
	}

	/**
	 * Disconnect the connection between this client and Redis server
	 * @returns {Promise<*>}
	 */
	async disconnect() {
		return this.connection.disconnect();
	}

	/**
	 * Connects to Redis service
	 * @returns {Promise<ioredis.connection>}
	 */
	async connect() {
		return new Promise(r => {
			// Create connection
			this.connection = new ioredis({
				port: this.config.port,
				host: this.config.host,
				family: this.config.family,
				db: this.config.db,
				username: this.config.auth && this.config.auth.user ? this.config.auth.user : undefined,
				password: this.config.auth && this.config.auth.password ? this.config.auth.password : undefined
			});

			this.query = this._RedisQueries(this.connection);
			delete this._RedisQueries;

			this.connection.once("ready", () => {
				console.info(`[OK] RedisDB`);
				return r(this);
			});
		});
	}
}

module.exports = RedisDB;