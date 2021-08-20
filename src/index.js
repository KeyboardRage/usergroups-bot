require("dotenv").config();
const config = require("./config");

const Bot = require("./struct/bot/Bot");
const bot = new Bot(config.bot_config, config.djs_config);

const MongoModels = require("./struct/mongo/Models");
const MongoQueries = require("./struct/mongo/Queries");
const Mongo = require("./struct/mongo/MongoDB");
const mongo = new Mongo(config.mongo_config, MongoModels, MongoQueries);

const RedisQueries = require("./struct/redis/Queries");
const Redis = require("./struct/redis/RedisDB");
const redis = new Redis(config.redis_config, RedisQueries);

const CommandAPI = require("./struct/command/CommandAPI");
const cmdApi = new CommandAPI(config.cmd_handler_config);

const GuildConfigAPI = require("./struct/guild/GuildConfigAPI");
const guildApi = new GuildConfigAPI(config.guild_config);

const GroupAPI = require("./struct/usergroups/GroupAPI");
const groupApi = new GroupAPI(config.group_config);

const ButtonListener = require("./struct/button-listener/ButtonListener");
const buttonListener = new ButtonListener(config.button_listener_config);

const PermissionAPI = require("./struct/permission/PermissionAPI");
const permsApi = new PermissionAPI(config.permissionApiConfig);

const ErrorAPI = require("./struct/error/ErrorAPI");
const errorApi = new ErrorAPI(config.errorApiConfig);

const GlobalAPI = require("./struct/GlobalAPI");
const api = new GlobalAPI({
	mongo,
	redis,
	bot,
	cmdApi,
	guildApi,
	groupApi,
	buttonListener,
	permsApi,
	errorApi,
});

(async () => {
	await Promise.all([
		mongo.connect(),
		redis.connect()
	]);
	// Load error handlers
	errorApi.loadHandlers();

	// Load usergroups
	await groupApi.loadAllGroups();

	// Setup bot
	bot.setup();

	/**
	 * The Lab: 439536193907064842
	 * Usergroups Bot: 873296049391943682
	 * Whissy's Playground: 798962345883205643
	 */
	await bot.start();
	await cmdApi.bulkPush("873296049391943682");
})();
