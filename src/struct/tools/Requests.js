const urlUtil = require("url");
const https = require("https");

class Requests {
	constructor() {}

	/**
	 * Perform a POST request
	 * @param {String} url The full remote URL to POST to
	 * @param {Object} data The data to send
	 * @param {Object} [headers={}] Optional headers to use
	 * @return {Promise<Object>}
	 * @constructor
	 */
	static POST(url, data, headers={}) {
		return new Promise(async (resolve,reject) => {
			data = JSON.stringify(data);
			headers = Object.assign({
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(data)
			}, headers);

			const parsedUrl = new urlUtil.URL(url);
			const options = {
				hostname: parsedUrl.hostname,
				port: parsedUrl.protocol.startsWith("https") ? 443 : 80, // Might not work as this is HTTPS lib
				path: parsedUrl.pathname,
				method: "POST",
				headers
			};

			const req = https.request(options, res => {
				let chunks = Array();
				res.on("data", d => chunks.push(d));

				res.on("end", () => {
					return resolve(JSON.parse(Buffer.concat(chunks)));
				});
			});
			req.on("error", reject);

			req.write(data);
			req.end();
		});
	}

	/**
	 * Return GET result as a raw buffer
	 * @param {String} url
	 * @return {Promise<Buffer>}
	 * @constructor
	 */
	static GET(url) {
		return new Promise(async (resolve) => {

			const parsedUrl = new urlUtil.URL(url);
			const options = {
				hostname: parsedUrl.hostname,
				port: parsedUrl.protocol.startsWith("https") ? 443 : 80, // Might not work as this is HTTPS lib
				path: parsedUrl.pathname,
				method: "GET",
			};

			https.get(options, res => {
				const chunks = Array();
				res.on("data", d => chunks.push(d));
				res.on("end", () => {
					return resolve(Buffer.concat(chunks));
				});
			});
		});
	}
}

module.exports = Requests;