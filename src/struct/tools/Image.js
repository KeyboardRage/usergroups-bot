const path = require("path");
const Requests = require("./Requests");
const ImageSize = require("image-size");

class Image {
	constructor() {
		this.config = require("./config").Image;
	}

	/**
	 * @typedef {Object} IsImageRequestResult
	 * @prop {Boolean} error Whether an error occurred or not. Error occurs if we don't serve a file.
	 * @prop {Boolean} result If it's a valid image or not
	 * @prop {Object} data Analysis container
	 * @prop {String} data.ext The file extension, without dot. E.g. 'png'
	 * @prop {String} data.mime The mimetype of this file, e.g. 'image/png'
	 * @prop {Boolean} data.valid If it's a valid image or not. Same as 'result'
	 * @prop {String} [message] An error message if error occurred
	 */
	/**
	 * @typedef {Object} IsImageResult
	 * @prop {String|null} ext File extension if file, without dot
	 * @prop {String|null} mime The mimetype if file
	 * @prop {Boolean} valid Whether it's a valid image file or not
	 */
	/**
	 * Check if an URL is a valid image or not
	 * @param {String} url
	 * @return {Promise<IsImageResult>}
	 */
	static async isImage(url) {
		const config = require("./config").Image;

		/**
		 * @type {IsImageRequestResult}
		 */
		const x = await Promise.resolve(Requests.POST(config.isImageUrl, {url}));
		return {
			ext: x.error || x.err_client || x.err_internal ? null : x.data.ext,
			mime: x.error || x.err_client || x.err_internal ? null : x.data.mime,
			valid: x.result
		};
	}

	/**
	 * Check the file dimensions of a file
	 * @param {String} filepath The absolute file path to check
	 * @return {{width: Number, height: Number}}
	 */
	static localImageDimensions(filepath) {
		if (!path.isAbsolute(filepath)) throw new Error(`Filepath must be absolute!`);
		return ImageSize(filepath);
	}

	/**
	 * Check the file dimensions of a remote file
	 * @param {String} url The remote URL to check
	 * @return {Promise<{width: Number, height: Number}>}
	 */
	static async remoteImageDimensions(url) {
		const bufferData = await Requests.GET(url);
		return ImageSize(bufferData);
	}
}

module.exports = Image;