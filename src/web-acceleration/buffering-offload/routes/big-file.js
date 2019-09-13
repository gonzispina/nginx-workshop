const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { Duplex } = require('readable-stream')

const stat = promisify(fs.stat);

const schema = {
  summary: 'File',
  description: 'Retrieves a file'
}

module.exports = async function fileHandler (fastify, opts, next) {
  const publicPath = path.resolve('public')
  const filePath = path.join(publicPath, 'big.file')
  const fileStat = await stat(filePath)
  fastify.get(opts.route, { schema }, async (request, reply) => {
    const total = fileStat.size
    let transfered = 0
    const logger = new Duplex({
      write: (data, enc, cb) => {
        transfered += data.length
        const percentage = Math.round(transfered / total * 100)
        fastify.log.info(`Transfered: ${percentage}% (${transfered}/${total})`)
        console.log()
        cb(null, data.toString())
      },
      read: (data) => {
        logger.push(data.toString())
      }
    })

    const rs = fs.createReadStream(filePath);
    rs.pipe(logger)
    reply.type('text/plain')
    reply.send(logger)
  })

  next()
}