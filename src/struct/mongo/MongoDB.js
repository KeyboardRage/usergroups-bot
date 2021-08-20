const mongoose = require("mongoose");

class MongoDB {
	/**
	 * Creates MongoDB API instance
	 * @param {Object} mongo_config
	 * @param {Function} ModelExporter Takes the DB connection and Mongoose to create and return object of models
	 * @param {Function} QueryExporter Takes the Models created as parameter and returns object of queries
	 */
	constructor(mongo_config, ModelExporter, QueryExporter) {
		this._ModelExporter = ModelExporter;
		this._QueryExporter = QueryExporter;

		this.config = mongo_config;

		/**
		 * The MongoDB connection
		 * @abstract
		 * @type {mongoose.Connection}
		 */
		this.connection = undefined;

		/**
		 * MongoDB models available. Model exporter populate this.
		 * @type {Object}
		 * @abstract
		 */
		this.model = Object();

		/**
		 * Container for queries. Query adapter populate this.
		 * @type {Object}
		 * @abstract
		 */
		this.query = Object();
	}

	/**
	 * Shortcut for connection
	 * @returns {mongoose.Connection}
	 */
	get con() {
		return this.connection;
	}

	/**
	 * Creates a new ObjectId and returns it
	 * @return {ObjectId}
	 */
	get newId() {
		return mongoose.Types.ObjectId();
	}

	/**
	 * Disconnect the connection between this client and MongoDB server
	 * @returns {Promise<*>}
	 */
	async disconnect() {
		return this.connection.close();
	}

	/**
	 * Connects to MongoDB, load models, and return the Mongo interface
	 * @async
	 * @returns {Promise<MongoDB>}
	 */
	async connect() {
		this.connection = await mongoose.connect(this.config.uri, this.config.options);

		this.model = this._ModelExporter(this.connection, mongoose);
		Object.assign(this.query, this._QueryExporter(this.model));
		delete this._ModelExporter;
		delete this._QueryExporter;

		console.info(`[OK] MongoDB`);
	}
}

module.exports = MongoDB;