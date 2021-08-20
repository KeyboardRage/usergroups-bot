module.exports = api => {
	process.on("SIGINT", async () => {
		await api.errorApi.alert(new Error("The process has been signaled to shut down."), "App.SIGINT");
	});

	process.on("SIGTERM", async () => {
		await api.errorApi.alert(new Error("The process has been signaled to shut down."), "App.SIGTERM");
	});

	process.on("unhandledRejection", async err => {
		await api.errorApi.alert(err, "App.unhandledRejection");
	});

	process.on("uncaughtException", async err => {
		await api.errorApi.alert(err, "App.uncaughtException");
	});
}