const fs = require('fs')
const path = require('path')
const ping = require('./ping')
const fastify = require('fastify')({
	logger: true,
	https: {
	  key: fs.readFileSync(path.join(__dirname, 'nginx.key')),
	  cert: fs.readFileSync(path.join(__dirname,'nginx.crt'))
	}
})

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
