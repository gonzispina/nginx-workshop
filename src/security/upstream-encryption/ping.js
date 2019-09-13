const schema = {
  summary: 'Ping',
  description: 'Returns pong',
  response: {
    200: {
      type: 'object',
      properties: {
        result: {
          type: 'string',
          description: 'pong'
        }
      }
    }
  }
}

module.exports = function pingHandler (fastify, opts, next) {
  fastify.get('/ping', { schema }, async (request, reply) => {
    reply.type('application/json').send({ result: 'pong' })
  })
  next()
}