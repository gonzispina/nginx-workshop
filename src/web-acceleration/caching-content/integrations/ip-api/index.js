/**
 * @name IP Api Integration module
 * @description Geolocalization by IP
 * @maintainer Gonzalo Spina
 */

const url = require('url');

const IPAPIRequest = require('./modules/ip-api-request');

// const headers = { 'user-agent': 'ipapi/ipapi-nodejs/0.3.0' };
const host = 'http://ip-api.com';
const type = 'json';

function IPAPI() {
	return this;
}


/**
 * Gets the location by ip.
 *
 * @param      {string}        ip           The ip
 * @param      {boolean}       promisify  The only headers
 * @return     {IPAPIRequest}  The location by ip.
 */
IPAPI.prototype.getLocationByIp = async function getCurrentByCityId(ip) {
	const strUrl = url.resolve(host, type, ip);
	const URL = url.parse(strUrl);
	const params = { ...URL, method: 'GET' };

	return new IPAPIRequest(params);
};

module.exports = new IPAPI();
