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
  const filePath = path.join(publicPath, 'big.file')
  fastify.get(opts.route, { schema }, async (request, reply) => {
    const rs = fs.createReadStream(filePath);
    reply.type('text/plain')
    reply.send(rs)
  })

  next()
}