/**
 * @name IP API Integration. Request module
 * @description Module that handles the request to weathermap. Is a passthrough stream.
 * @maintainer Gonzalo Spina
 */

const http = require('http')
const { PassThrough } = require('readable-stream')
const flatstr = require('flatstr')
const { inherits } = require('util')

function IPAPIRequest(params) {
	PassThrough.call(this, { objectMode: true, highWaterMark: 16 })
	this.error = null
	return this.makeRequest(params)
}

inherits(IPAPIRequest, PassThrough)

/**
 * Write
 *
 * @param      {object}    object    The object
 * @param      {string}    encoding  The encoding
 * @param      {Function}  callback  The callback
 */
// eslint-disable-next-line
IPAPIRequest.prototype._write = function _wirte(object, encoding, callback) {
	this.push(object) // Passtrough
	callback(this.error, encoding) // Error is null until an error is detected
}

/**
 * Makes a request.
 *
 * @param      {object}  params  The parameters
 * @return     {EventEmitter}  The weather map request
 */
IPAPIRequest.prototype.makeRequest = function makeRequest(params) {
	return new Promise((resolve, reject) => {
		this.request = http.request(params, (response) => {
			response.pipe(this, { end: true })
			response.on('end', this.destroy)
			resolve(this)
		})

		this.request.on('error', (err) => {
			this.error = err
			this.write(null)
			reject(err)
		})

		this.request.end()
	})
}

/**
 * Promisifies an stream
 *
 * @param      {boolean}  [json=true]  The json
 * @return     {Promise}  The Request promisified
 */
IPAPIRequest.prototype.toPromise = function toPromise(json = true) {
	return new Promise((resolve, reject) => {
		let data = '';
		this.on('readable', () => {
			let chunk = this.read()
			while (chunk !== null) {
				data += chunk.toString()
				chunk = this.read()
			}
		})

		this.on('end', () => {
			if (!data) {
				resolve(data)
				return
			}

			if (this.error) {
				reject(this.error)
				return
			}

			try {
				const res = json ? JSON.parse(flatstr(data)) : data
				resolve(res)
			} catch (err) {
				reject(err)
			}
		})

		this.on('error', err => reject(err))
	})
}


module.exports = IPAPIRequest
