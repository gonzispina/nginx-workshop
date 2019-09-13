const ping = require('./ping')

module.exports = (fastify, opts, next) => {
	fastify.register(ping, opts, next)
}
