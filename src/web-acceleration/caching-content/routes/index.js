const ping = require('./ping')
const location = require('./location')
const file = require('./file')

module.exports = (fastify, opts, next) => {
	fastify.register(ping, opts, next)
	fastify.register(location, opts, next)
	fastify.register(file, opts, next)
}
