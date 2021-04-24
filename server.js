const fastify = require('fastify')({
  logger: true
})
const path = require('path');

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
})


fastify.get('/', function (req, reply) {
    return reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
  })

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()