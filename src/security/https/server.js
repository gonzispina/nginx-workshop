const path = require('path')
const fastify = require('fastify')({ logger: true })
const ping = require('./ping')

fastify.register(ping, { prefix: 'v1' })

async function start() {
	try {
		await fastify.listen(4500, '0.0.0.0')
	} catch(err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start()
