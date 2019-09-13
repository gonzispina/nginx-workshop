const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const stat = promisify(fs.stat);

const schema = {
  summary: 'File',
  description: 'Retrieves a file'
}

module.exports = function fileHandler (fastify, opts, next) {
  const publicPath = path.resolve('public')
  fastify.get('/file', { schema }, async (request, reply) => {
    // HORRIBLE API PERO BUE ES CON FINES DEMOSTRATIVOS
    const { name } = request.query

    if (!name) {
      reply.type('application/json')
      reply.send({ status: 400, message: 'bad request' })
      return
    }

    const filePath = path.join(publicPath, name)

    let fstat;
    try {
      fstat = await stat(filePath)
    } catch (err) {
      reply.type('application/json')
      reply.send({ status: 404, message: 'resource not found' })
      return
    }

    if (!fstat.isFile()) {
      reply.type('application/json')
      reply.send({ status: 404, message: 'resource not found' })
      return
    }

    const rs = fs.createReadStream(filePath);
    reply.type('text/plain')
    reply.send(rs)
  })
  next()
}