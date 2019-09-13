const IPAPI = require('../integrations/ip-api');

const schema = {
  summary: 'Current location service',
  description: 'Returns the user\'s current location',
  headers: {
    'x-forwarded-ip': { type: 'string' }
  },
  response: {
    200: {
      type: 'object'
    }
  }
}

module.exports = function locationHandler (fastify, opts, next) {
  fastify.get('/location', { schema }, async (request, reply) => {
    const ip = request.headers['x-real-ip'];
    const locationStream = await IPAPI.getLocationByIp(ip);

    reply.type('application/json')
    reply.send(locationStream)
  })
  next()
}