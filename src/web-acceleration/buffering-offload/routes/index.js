const file = require('./big-file')

module.exports = (fastify, opts, next) => {
	fastify.register(file, { ...opts, route: '/buffered' }, next)
	fastify.register(file, { ...opts, route: '/unbuffered' }, next)
}
