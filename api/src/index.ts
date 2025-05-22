
import { databaseStartup, databaseShutdown } from './lib/database'
import { app, makeServer } from './lib/express'
import { makeRoutes } from './routes'
import { NODE_ENV, DOMAIN, PORT } from './lib/env'

import './cron'

async function gracefulShutdown() {
  console.log('Shutting down gracefully...')
  await databaseShutdown()
  process.exit(0)
}

async function gracefulStartup() {
  await databaseStartup()
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

const server = makeServer(
  makeRoutes(app)
)

gracefulStartup().then(() => server.listen(PORT, () => {
  console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`)
  console.log(`API is running at ${DOMAIN}`)
}))
