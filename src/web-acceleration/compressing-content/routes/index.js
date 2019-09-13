const file = require('./big-file')

module.exports = (fastify, opts, next) => {
	fastify.register(file, { ...opts, route: '/compressed' }, next)
	fastify.register(file, { ...opts, route: '/uncompressed' }, next)
}
