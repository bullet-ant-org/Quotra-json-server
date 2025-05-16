const jsonServer = require('json-server')
const server = jsonServer.create()
const db = require('./db.json')
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Auto-discover endpoints
const endpoints = Object.keys(db).flatMap(resource => [
  { method: 'GET', path: `/${resource}` },
  { method: 'GET', path: `/${resource}/:id` },
  { method: 'POST', path: `/${resource}` },
  { method: 'PUT', path: `/${resource}/:id` },
  { method: 'DELETE', path: `/${resource}/:id` }
])

// Request logger
server.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

server.use(middlewares)
server.use(router)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`\n🚀 Server ready at http://localhost:${PORT}`)
  console.log('🔍 Available endpoints:')
  endpoints.forEach(ep => console.log(`- ${ep.method} ${ep.path}`))
})